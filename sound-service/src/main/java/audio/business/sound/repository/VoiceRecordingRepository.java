package audio.business.sound.repository;

import audio.business.sound.model.VoiceRecording;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VoiceRecordingRepository extends JpaRepository<VoiceRecording, UUID> {
    List<VoiceRecording> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}
