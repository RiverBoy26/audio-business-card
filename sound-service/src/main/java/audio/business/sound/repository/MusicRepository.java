package audio.business.sound.repository;

import audio.business.sound.model.MusicFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MusicRepository extends JpaRepository<MusicFile, UUID> {
    List<MusicFile> findAllByUserId(UUID userId);
}
