package audio.business.card.service.impl;

import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardSettings;
import audio.business.card.mapper.AudioCardMapper;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.service.interfaces.AudioCardService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AudioCardServiceImp implements AudioCardService {
    private final AudioCardRepository audioCardRepository;

    public AudioCardServiceImp(AudioCardRepository audioCardRepository) {
        this.audioCardRepository = audioCardRepository;
    }

    @Override
    public List<AudioCardResponse> findAllByUserId(UUID userId) {
        return audioCardRepository.findAllByUserId(userId)
                .stream()
                .map(AudioCardMapper::toResponse)
                .toList();
    }

    @Override
    public AudioCardResponse findById(UUID userId, UUID audioCardId) {
        AudioCard audioCard = audioCardRepository.findByIdAndUserId(audioCardId, userId)
                        .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Аудиовизитка не найдена!"));

        return AudioCardMapper.toResponse(audioCard);
    }

    @Override
    public AudioCardResponse create(UUID userId, AudioCardRequest audioCard) {
        AudioCard card = AudioCardMapper.toEntity(audioCard);
        card.setUserId(userId);

        CardSettings settings = new CardSettings();
        settings.setAudioCard(card);
        card.setSettings(settings);

        AudioCard saveCard = audioCardRepository.save(card);

        return AudioCardMapper.toResponse(saveCard);
    }

    @Override
    public AudioCardResponse update(UUID userId, UUID audioCardId, AudioCardRequest newAudioCard) {
        AudioCard card = audioCardRepository.findByIdAndUserId(audioCardId, userId).
                orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Аудиовизитка не найдена!"));

        if (newAudioCard.getTitle() != null) {
            card.setTitle(newAudioCard.getTitle());
        }

        if (newAudioCard.getDescription() != null) {
            card.setDescription(newAudioCard.getDescription());
        }

        if (newAudioCard.getPhotoUrl() != null) {
            card.setPhotoUrl(newAudioCard.getPhotoUrl());
        }



        AudioCard updateCard = audioCardRepository.save(card);

        return AudioCardMapper.toResponse(updateCard);
    }

    @Override
    public void delete(UUID userId, UUID audioCardId) {
        AudioCard card = audioCardRepository
                .findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена"
                ));

        audioCardRepository.delete(card);
    }
}
