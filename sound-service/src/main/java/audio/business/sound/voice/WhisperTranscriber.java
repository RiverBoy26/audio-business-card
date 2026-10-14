package audio.business.sound.voice;

import io.github.givimad.whisperjni.WhisperFullParams;
import io.github.givimad.whisperjni.WhisperJNI;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/** FFmpeg accepts browser WebM/Opus and converts to Whisper's 16 kHz mono float PCM. */
public final class WhisperTranscriber implements SpeechTranscriber {
    private final Path model;
    private final String ffmpeg;
    private final int maxSeconds;

    public WhisperTranscriber(Path model, String ffmpeg, int maxSeconds) {
        if (maxSeconds < 1 || maxSeconds > 300) throw new IllegalArgumentException("Duration must be 1..300 seconds");
        this.model = model;
        this.ffmpeg = ffmpeg;
        this.maxSeconds = maxSeconds;
    }

    @Override
    public String transcribe(Path audio) throws Exception {
        if (!Files.isRegularFile(model)) throw new IOException("Whisper model not found: " + model);
        if (!Files.isRegularFile(audio) || Files.size(audio) > 25L * 1024 * 1024)
            throw new IOException("Audio must be a file of at most 25 MiB");
        Path pcm = Files.createTempFile("voice-profile-", ".pcm");
        Path log = Files.createTempFile("voice-profile-", ".log");
        try {
            Process process = new ProcessBuilder(ffmpeg, "-nostdin", "-v", "error", "-y", "-i",
                    audio.toAbsolutePath().toString(), "-t", String.valueOf(maxSeconds + 1),
                    "-vn", "-ar", "16000", "-ac", "1", "-f", "f32le", pcm.toString())
                    .redirectError(log.toFile()).redirectOutput(ProcessBuilder.Redirect.DISCARD).start();
            try {
                if (!process.waitFor(30, TimeUnit.SECONDS)) throw new IOException("FFmpeg timed out");
                if (process.exitValue() != 0) throw new IOException("FFmpeg could not decode audio: " + Files.readString(log));
            } finally {
                if (process.isAlive()) process.destroyForcibly();
            }
            byte[] bytes = Files.readAllBytes(pcm);
            int count = bytes.length / Float.BYTES;
            if (count == 0 || count > maxSeconds * 16000) throw new IOException("Audio is empty or exceeds " + maxSeconds + " seconds");
            float[] samples = new float[count];
            ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer().get(samples);
            WhisperJNI.loadLibrary();
            WhisperJNI.setLibraryLogger(null);
            WhisperJNI whisper = new WhisperJNI();
            try (var context = whisper.init(model)) {
                var params = new WhisperFullParams();
                params.language = "ru";
                params.translate = false;
                params.printProgress = false;
                params.printRealtime = false;
                params.printTimestamps = false;
                params.nThreads = Math.min(4, Runtime.getRuntime().availableProcessors());
                int result = whisper.full(context, params, samples, samples.length);
                if (result != 0) throw new IOException("Whisper failed with code " + result);
                StringBuilder text = new StringBuilder();
                for (int i = 0; i < whisper.fullNSegments(context); i++)
                    text.append(whisper.fullGetSegmentText(context, i)).append(' ');
                return text.toString().trim();
            }
        } finally {
            Files.deleteIfExists(pcm);
            Files.deleteIfExists(log);
        }
    }
}
