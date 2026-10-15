package audio.business.card.service.impl;

import audio.business.card.dto.request.CardExperienceRequest;
import audio.business.card.dto.response.CardExperienceResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardExperience;
import audio.business.card.mapper.CardExperienceMapper;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.repository.CardExperienceRepository;

import audio.business.card.service.interfaces.CardExperienceService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class CardExperienceServiceImp implements CardExperienceService {

    private final AudioCardRepository audioCardRepository;
    private final CardExperienceRepository cardExperienceRepository;

    public CardExperienceServiceImp(
            AudioCardRepository audioCardRepository,
            CardExperienceRepository cardExperienceRepository
    ) {
        this.audioCardRepository = audioCardRepository;
        this.cardExperienceRepository = cardExperienceRepository;
    }

    private AudioCard findOwnedCard(UUID userId, UUID audioCardId) {
        return audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Аудиовизитка не найдена"));
    }

    @Override
    @Transactional(readOnly = true)
    public CardExperienceResponse findByAudioCardId(
            UUID userId,
            UUID audioCardId
    ) {
        AudioCard card = findOwnedCard(userId, audioCardId);

        CardExperience experience = cardExperienceRepository
                .findByAudioCardId(audioCardId)
                .orElseGet(() -> {
                    CardExperience defaultExperience = new CardExperience();
                    defaultExperience.setAudioCard(card);
                    defaultExperience.setExperienceYears(0);
                    return defaultExperience;
                });

        return CardExperienceMapper.toResponse(experience);
    }

    @Override
    @Transactional
    public CardExperienceResponse update(
            UUID userId,
            UUID audioCardId,
            CardExperienceRequest request
    ) {
        AudioCard card = findOwnedCard(userId, audioCardId);

        CardExperience experience = cardExperienceRepository
                .findByAudioCardId(audioCardId)
                .orElseGet(() -> CardExperienceMapper.toEntity(request, card));

        experience.setExperienceYears(request.getExperienceYears());

        CardExperience savedExperience =
                cardExperienceRepository.save(experience);

        return CardExperienceMapper.toResponse(savedExperience);
    }
}