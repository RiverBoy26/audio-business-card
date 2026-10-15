package audio.business.card.repository;

import audio.business.card.entity.CardSphere;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardSphereRepository extends JpaRepository<CardSphere, UUID> {
    List<CardSphere> findAllByAudioCardId(UUID cardId);

    Optional<CardSphere> findByIdAndAudioCardId(UUID id, UUID audioCardId);

    void deleteAllByAudioCardId(UUID cardId);
}
