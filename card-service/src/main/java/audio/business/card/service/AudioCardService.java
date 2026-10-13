package audio.business.card.service;

import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardSettings;
import audio.business.card.repository.AudioCardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AudioCardService {
    private final AudioCardRepository audioCardRepository;

    public AudioCardService(AudioCardRepository audioCardRepository) {
        this.audioCardRepository = audioCardRepository;
    }

    public List<AudioCard> findAllByUserId(UUID userId) {
        return audioCardRepository.findAllByUserId(userId);
    }

    public AudioCard findById(UUID audioCardId) {
        return audioCardRepository.findById(audioCardId).
                orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Аудиовизитка не найдена!"));
    }

    public UUID create(UUID userId, AudioCard audioCard) {
        audioCard.setUserId(userId);

        CardSettings settings = new CardSettings();
        settings.setAudioCard(audioCard);

        audioCard.setSettings(settings);

        return audioCardRepository.save(audioCard).getId();
    }

    public UUID update(UUID userId, UUID audioCardId, AudioCard newAudioCard) {
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



        return audioCardRepository.save(card).getId();
    }

    public UUID delete(UUID userId, UUID audioCardId) {
        AudioCard card = audioCardRepository
                .findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена"
                ));

        audioCardRepository.delete(card);

        return audioCardId;
    }
}
