package audio.business.card.repository;

import audio.business.card.entity.CardStack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardStackRepository extends JpaRepository<CardStack, UUID> {
    List<CardStack> findAllByAudioCardId(UUID cardId);

    Optional<CardStack> findByIdAndAudioCardId(UUID id, UUID audioCardId);

    void deleteAllByAudioCardId(UUID cardId);
}