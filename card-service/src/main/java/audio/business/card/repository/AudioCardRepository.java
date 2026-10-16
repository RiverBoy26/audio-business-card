package audio.business.card.repository;

import audio.business.card.entity.AudioCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AudioCardRepository extends JpaRepository<AudioCard, UUID> {
    List<AudioCard> findAllByUserId(UUID userId);

    Optional<AudioCard> findByIdAndUserId(UUID audioCardId, UUID userId);

    Optional<AudioCard> findByIdAndIsPublishedTrue(UUID audioCardId);

    Optional<AudioCard> findByPublicCodeAndIsPublishedTrue(String publicCode);

    boolean existsByPublicCode(String publicCode);
}
