package audio.business.sound.voice;

import javax.sound.sampled.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicBoolean;

/** Developer console capture; production supplies a browser recording instead. */
public final class MicrophoneRecorder {
    public void record(Path output, int maxSeconds) throws Exception {
        if (maxSeconds < 1 || maxSeconds > 120) throw new IllegalArgumentException("Recording duration must be 1..120 seconds");
        AudioFormat format = new AudioFormat(16000, 16, 1, true, false);
        try (TargetDataLine line = (TargetDataLine) AudioSystem.getLine(new DataLine.Info(TargetDataLine.class, format))) {
            line.open(format);
            AtomicBoolean stopRequested = new AtomicBoolean();
            Thread enterListener = new Thread(() -> {
                try {
                    if (System.in.read() >= 0) stopRequested.set(true);
                } catch (Exception ignored) { }
            }, "voice-recording-enter-listener");
            enterListener.setDaemon(true);
            enterListener.start();

            line.start();
            long deadline = System.nanoTime() + maxSeconds * 1_000_000_000L;
            byte[] chunk = new byte[4096];
            ByteArrayOutputStream recording = new ByteArrayOutputStream(maxSeconds * 16000 * 2);
            while (!stopRequested.get() && System.nanoTime() < deadline) {
                int read = line.read(chunk, 0, chunk.length);
                if (read <= 0) throw new IllegalStateException("Microphone returned no data");
                recording.write(chunk, 0, read);
            }
            line.stop();
            byte[] bytes = recording.toByteArray();
            if (bytes.length < 16000)
                throw new IllegalStateException("Recording is too short; speak before pressing Enter");
            try (AudioInputStream stream = new AudioInputStream(new ByteArrayInputStream(bytes), format, bytes.length / 2)) {
                AudioSystem.write(stream, AudioFileFormat.Type.WAVE, output.toFile());
            }
        }
    }
}
