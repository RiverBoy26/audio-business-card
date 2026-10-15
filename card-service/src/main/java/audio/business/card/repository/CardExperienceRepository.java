package audio.business.card.repository;

import audio.business.card.entity.CardExperience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CardExperienceRepository extends JpaRepository<CardExperience, UUID> {
    Optional<CardExperience> findByAudioCardId(UUID cardId);

    void deleteByAudioCardId(UUID cardId);
}
