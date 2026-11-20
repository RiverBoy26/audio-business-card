
package audio.business.card.service.impl;

import audio.business.card.dto.request.CardSphereRequest;
import audio.business.card.dto.response.CardSphereResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardSphere;
import audio.business.card.entity.Sphere;
import audio.business.card.mapper.CardSphereMapper;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.repository.CardSphereRepository;
import audio.business.card.repository.SphereRepository;
import audio.business.card.service.interfaces.CardSphereService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CardSphereServiceImp implements CardSphereService {

    private final AudioCardRepository audioCardRepository;
    private final CardSphereRepository cardSphereRepository;
    private final SphereRepository sphereRepository;

    public CardSphereServiceImp(
            AudioCardRepository audioCardRepository,
            CardSphereRepository cardSphereRepository,
            SphereRepository sphereRepository
    ) {
        this.audioCardRepository = audioCardRepository;
        this.cardSphereRepository = cardSphereRepository;
        this.sphereRepository = sphereRepository;
    }

    private AudioCard findOwnedCard(UUID userId, UUID audioCardId) {
        return audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена"
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardSphereResponse> findAll(
            UUID userId,
            UUID audioCardId
    ) {
        findOwnedCard(userId, audioCardId);

        return cardSphereRepository.findAllByAudioCardId(audioCardId)
                .stream()
                .map(CardSphereMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<CardSphereResponse> add(
            UUID userId,
            UUID audioCardId,
            CardSphereRequest request
    ) {
        AudioCard card = findOwnedCard(userId, audioCardId);

        List<CardSphere> cardSpheres = new ArrayList<>();

        for (UUID sphereId : request.getSphereIds()) {
            Sphere sphere = sphereRepository.findById(sphereId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Сфера деятельности не найдена: " + sphereId
                    ));

            CardSphere cardSphere =
                    CardSphereMapper.toEntity(card, sphere);

            cardSpheres.add(cardSphere);
        }

        List<CardSphere> savedSpheres =
                cardSphereRepository.saveAll(cardSpheres);

        return savedSpheres.stream()
                .map(CardSphereMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(
            UUID userId,
            UUID audioCardId,
            UUID sphereId
    ) {
        findOwnedCard(userId, audioCardId);

        CardSphere sphere = cardSphereRepository
                .findByIdAndAudioCardId(sphereId, audioCardId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Сфера не найдена"
                ));

        cardSphereRepository.delete(sphere);
    }
}