package audio.business.sound.voice;

import java.nio.file.Path;

/** Transport-independent entry point for a future HTTP controller. */
public final class VoiceProfileService {
    private final SpeechTranscriber transcriber;
    private final ProfileValidator validator;

    public VoiceProfileService(SpeechTranscriber transcriber, ProfileValidator validator) {
        this.transcriber = transcriber;
        this.validator = validator;
    }

    public VoiceProfile extract(Path audio) throws Exception {
        return validator.validate(transcriber.transcribe(audio));
    }
}
