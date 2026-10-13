package audio.business.card.service;

import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardSettings;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.repository.CardSettingsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class CardSettingsService {
    private final CardSettingsRepository cardSettingsRepository;
    private final AudioCardRepository audioCardRepository;

    public CardSettingsService(CardSettingsRepository cardSettingsRepository,
                               AudioCardRepository audioCardRepository) {
        this.cardSettingsRepository = cardSettingsRepository;
        this.audioCardRepository = audioCardRepository;
    }

    public CardSettings findByAudioCardId(UUID userId, UUID audioCardId) {
        AudioCard card = audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена!"));

        return cardSettingsRepository.findById(card.getId()).
                orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Настройки не найдены!"));
    }

    public CardSettings update(UUID userId, UUID audioCardId,
                               CardSettings newCardSettings) {

        AudioCard card = audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена!"));

        CardSettings settings = cardSettingsRepository.findById(card.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Настройки не найдены!"));

        if (newCardSettings.getVoiceVolume() != null) {
            settings.setVoiceVolume(newCardSettings.getVoiceVolume());
        }

        if (newCardSettings.getMusicVolume() != null) {
            settings.setMusicVolume(newCardSettings.getMusicVolume());
        }

        return cardSettingsRepository.save(settings);
    }
}
