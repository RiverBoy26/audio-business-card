package audio.business.sound.voice;

import javax.sound.sampled.*;
import java.io.ByteArrayInputStream;
import java.nio.file.Path;

/** Developer console capture; production supplies a browser recording instead. */
public final class MicrophoneRecorder {
    public void record(Path output, int seconds) throws Exception {
        if (seconds < 1 || seconds > 120) throw new IllegalArgumentException("Recording duration must be 1..120 seconds");
        AudioFormat format = new AudioFormat(16000, 16, 1, true, false);
        try (TargetDataLine line = (TargetDataLine) AudioSystem.getLine(new DataLine.Info(TargetDataLine.class, format))) {
            line.open(format);
            byte[] bytes = new byte[seconds * 16000 * 2];
            line.start();
            int offset = 0;
            while (offset < bytes.length) {
                int read = line.read(bytes, offset, Math.min(4096, bytes.length - offset));
                if (read <= 0) throw new IllegalStateException("Microphone returned no data");
                offset += read;
            }
            line.stop();
            try (AudioInputStream stream = new AudioInputStream(new ByteArrayInputStream(bytes), format, bytes.length / 2)) {
                AudioSystem.write(stream, AudioFileFormat.Type.WAVE, output.toFile());
            }
        }
    }
}
