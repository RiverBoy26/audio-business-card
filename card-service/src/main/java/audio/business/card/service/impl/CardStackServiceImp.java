package audio.business.card.service.impl;

import audio.business.card.dto.request.CardStackRequest;
import audio.business.card.dto.response.CardStackResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardStack;
import audio.business.card.entity.Stack;
import audio.business.card.mapper.CardStackMapper;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.repository.CardStackRepository;

import audio.business.card.repository.StackRepository;
import audio.business.card.service.interfaces.CardStackService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CardStackServiceImp implements CardStackService {
    private final AudioCardRepository audioCardRepository;
    private final CardStackRepository cardStackRepository;
    private final StackRepository stackRepository;

    public CardStackServiceImp(AudioCardRepository audioCardRepository,
            CardStackRepository cardStackRepository, StackRepository stackRepository) {
        this.audioCardRepository = audioCardRepository;
        this.cardStackRepository = cardStackRepository;
        this.stackRepository = stackRepository;
    }

    private AudioCard findOwnedCard(UUID userId, UUID audioCardId) {
        return audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardStackResponse> findAll(UUID userId, UUID audioCardId) {
        findOwnedCard(userId, audioCardId);

        return cardStackRepository.findAllByAudioCardId(audioCardId)
                .stream()
                .map(CardStackMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<CardStackResponse> add(
            UUID userId,
            UUID audioCardId,
            CardStackRequest request
    ) {
        AudioCard card = findOwnedCard(userId, audioCardId);

        List<CardStack> cardStacks = new ArrayList<>();

        for (UUID stackId : request.getStackIds()) {

            Stack stack = stackRepository.findById(stackId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Технология не найдена: " + stackId
                    ));

            CardStack cardStack = CardStackMapper.toEntity(card, stack);
            cardStacks.add(cardStack);
        }

        List<CardStack> savedStacks = cardStackRepository.saveAll(cardStacks);

        return savedStacks.stream()
                .map(CardStackMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID audioCardId, UUID stackId) {
        findOwnedCard(userId, audioCardId);

        CardStack stack = cardStackRepository
                .findByIdAndAudioCardId(stackId, audioCardId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Стек не найден"));

        cardStackRepository.delete(stack);
    }
}