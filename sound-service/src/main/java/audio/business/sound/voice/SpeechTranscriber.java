package audio.business.sound.voice;

import java.nio.file.Path;

public interface SpeechTranscriber {
    String transcribe(Path audio) throws Exception;
}
