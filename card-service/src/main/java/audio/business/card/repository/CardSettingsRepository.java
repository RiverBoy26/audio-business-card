package audio.business.card.repository;

import audio.business.card.entity.CardSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CardSettingsRepository extends JpaRepository<CardSettings, UUID> {
}
