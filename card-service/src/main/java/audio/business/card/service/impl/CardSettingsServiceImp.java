package audio.business.card.service.impl;

import audio.business.card.dto.response.CardSettingResponse;
import audio.business.card.dto.request.CardSettingsRequest;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardSettings;
import audio.business.card.mapper.CardSettingsMapper;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.repository.CardSettingsRepository;
import audio.business.card.service.interfaces.CardSettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class CardSettingsServiceImp implements CardSettingsService {
    private final CardSettingsRepository cardSettingsRepository;
    private final AudioCardRepository audioCardRepository;

    public CardSettingsServiceImp(CardSettingsRepository cardSettingsRepository,
                                  AudioCardRepository audioCardRepository) {
        this.cardSettingsRepository = cardSettingsRepository;
        this.audioCardRepository = audioCardRepository;
    }

    @Override
    public CardSettingResponse findByAudioCardId(UUID userId, UUID audioCardId) {
        AudioCard card = audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена!"));

        CardSettings cardSettings = cardSettingsRepository.findById(card.getId()).
                orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Настройки не найдены!"));

        return CardSettingsMapper.toResponse(cardSettings);
    }

    @Override
    public CardSettingResponse update(UUID userId, UUID audioCardId,
                               CardSettingsRequest newCardSettings) {

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

        CardSettings saveCardSetting = cardSettingsRepository.save(settings);

        return CardSettingsMapper.toResponse(saveCardSetting);
    }
}
