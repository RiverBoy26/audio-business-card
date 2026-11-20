package audio.business.sound.voice;

import com.k2fsa.sherpa.onnx.OfflineModelConfig;
import com.k2fsa.sherpa.onnx.OfflineNemoEncDecCtcModelConfig;
import com.k2fsa.sherpa.onnx.OfflineRecognizer;
import com.k2fsa.sherpa.onnx.OfflineRecognizerConfig;
import com.k2fsa.sherpa.onnx.OfflineTransducerModelConfig;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/** Local ASR using GigaAM RNNT or NeMo CTC through sherpa-onnx. */
public final class SherpaOnnxTranscriber implements SpeechTranscriber, AutoCloseable {
    private record AudioData(float[] samples, int sampleRate) {}

    private final OfflineRecognizer recognizer;
    private final String ffmpeg;
    private final int maxSeconds;
    private final AtomicBoolean closed = new AtomicBoolean();

    public SherpaOnnxTranscriber(Path modelDirectory, String ffmpeg, int maxSeconds) throws IOException {
        if (maxSeconds < 1 || maxSeconds > 300) throw new IllegalArgumentException("Duration must be 1..300 seconds");
        Path directory = modelDirectory.toAbsolutePath().normalize();
        Path tokens = required(directory, "tokens.txt");
        var builder = OfflineModelConfig.builder()
                .setTokens(tokens.toString())
                .setNumThreads(Math.max(1, Math.min(4, Runtime.getRuntime().availableProcessors())))
                .setProvider("cpu")
                .setDebug(false);
        Path ctc = directory.resolve("model.int8.onnx");
        if (Files.isRegularFile(ctc)) {
            builder.setNemo(OfflineNemoEncDecCtcModelConfig.builder()
                    .setModel(ctc.toString()).build());
        } else {
            builder.setTransducer(OfflineTransducerModelConfig.builder()
                    .setEncoder(required(directory, "encoder.int8.onnx").toString())
                    .setDecoder(required(directory, "decoder.onnx").toString())
                    .setJoiner(required(directory, "joiner.onnx").toString()).build())
                    .setModelType("nemo_transducer");
        }
        var model = builder.build();
        var config = OfflineRecognizerConfig.builder()
                .setOfflineModelConfig(model)
                .setDecodingMethod("greedy_search")
                .build();
        this.recognizer = new OfflineRecognizer(config);
        this.ffmpeg = ffmpeg;
        this.maxSeconds = maxSeconds;
    }

    @Override
    public String transcribe(Path audio) throws Exception {
        if (closed.get()) throw new IllegalStateException("Speech recognizer is closed");
        if (!Files.isRegularFile(audio) || Files.size(audio) > 25L * 1024 * 1024)
            throw new IOException("Audio must be a file of at most 25 MiB");
        AudioData data = readPcmWave(audio);
        if (data == null) data = decodeWithFfmpeg(audio);
        validateDuration(data);

        synchronized (recognizer) {
            if (closed.get()) throw new IllegalStateException("Speech recognizer is closed");
            var stream = recognizer.createStream();
            try {
                stream.acceptWaveform(data.samples, data.sampleRate);
                recognizer.decode(stream);
                return recognizer.getResult(stream).getText().trim();
            } finally {
                stream.release();
            }
        }
    }

    private AudioData readPcmWave(Path audio) throws IOException {
        try (AudioInputStream stream = AudioSystem.getAudioInputStream(audio.toFile())) {
            AudioFormat format = stream.getFormat();
            if (!AudioFormat.Encoding.PCM_SIGNED.equals(format.getEncoding())
                    || format.getSampleSizeInBits() != 16 || format.getChannels() != 1
                    || format.getFrameSize() != 2 || format.getSampleRate() < 8000) return null;
            byte[] bytes = stream.readAllBytes();
            if (bytes.length % 2 != 0) throw new IOException("Invalid 16-bit PCM audio");
            float[] samples = new float[bytes.length / 2];
            ByteBuffer buffer = ByteBuffer.wrap(bytes).order(format.isBigEndian() ? ByteOrder.BIG_ENDIAN : ByteOrder.LITTLE_ENDIAN);
            for (int i = 0; i < samples.length; i++) samples[i] = buffer.getShort() / 32768.0f;
            return new AudioData(samples, Math.round(format.getSampleRate()));
        } catch (UnsupportedAudioFileException e) {
            return null;
        }
    }

    private AudioData decodeWithFfmpeg(Path audio) throws Exception {
        Path pcm = Files.createTempFile("voice-profile-", ".pcm");
        Path log = Files.createTempFile("voice-profile-", ".log");
        try {
            Process process = new ProcessBuilder(ffmpeg, "-nostdin", "-v", "error", "-y", "-i",
                    audio.toAbsolutePath().toString(), "-t", String.valueOf(maxSeconds + 1), "-vn", "-af",
                    "silenceremove=start_periods=1:start_duration=0.10:start_threshold=-45dB:stop_periods=-1:stop_duration=0.60:stop_threshold=-45dB",
                    "-ar", "16000", "-ac", "1", "-f", "f32le", pcm.toString())
                    .redirectError(log.toFile()).redirectOutput(ProcessBuilder.Redirect.DISCARD).start();
            try {
                if (!process.waitFor(30, TimeUnit.SECONDS)) throw new IOException("FFmpeg timed out");
                if (process.exitValue() != 0) throw new IOException("FFmpeg could not decode audio: " + Files.readString(log));
            } finally {
                if (process.isAlive()) process.destroyForcibly();
            }
            byte[] bytes = Files.readAllBytes(pcm);
            if (bytes.length % Float.BYTES != 0) throw new IOException("Invalid decoded audio");
            float[] samples = new float[bytes.length / Float.BYTES];
            ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer().get(samples);
            return new AudioData(samples, 16000);
        } finally {
            Files.deleteIfExists(pcm);
            Files.deleteIfExists(log);
        }
    }

    private void validateDuration(AudioData data) throws IOException {
        if (data.samples.length == 0 || data.samples.length > (long) maxSeconds * data.sampleRate)
            throw new IOException("Audio is empty or exceeds " + maxSeconds + " seconds");
    }

    private static Path required(Path directory, String name) throws IOException {
        Path file = directory.resolve(name).normalize();
        if (!file.getParent().equals(directory) || !Files.isRegularFile(file))
            throw new IOException("GigaAM model file not found: " + file);
        return file;
    }

    @Override
    public void close() {
        if (closed.compareAndSet(false, true)) {
            synchronized (recognizer) {
                recognizer.release();
            }
        }
    }
}
