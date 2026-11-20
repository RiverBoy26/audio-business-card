package audio.business.sound.voice;

import java.util.List;

/** Result awaiting user confirmation. FIO is supplied by the profile, never extracted. */
public record VoiceProfile(String transcript, String sphere, String specialization,
                           List<String> skills, Experience experience, String desiredPosition,
                           List<String> unknownSkills, List<String> issues, boolean requiresConfirmation) {
    public record Experience(Integer minMonths, Integer maxMonths, String raw) {}
}
