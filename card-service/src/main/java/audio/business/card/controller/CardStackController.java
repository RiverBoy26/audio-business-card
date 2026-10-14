package audio.business.card.controller;

import audio.business.card.dto.request.CardStackRequest;
import audio.business.card.dto.response.CardStackResponse;

import audio.business.card.service.interfaces.CardStackService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/audio-cards/{audioCardId}/stacks")
public class CardStackController {
    private final CardStackService cardStackService;

    public CardStackController(CardStackService cardStackService) {
        this.cardStackService = cardStackService;
    }

    @GetMapping
    public List<CardStackResponse> findAll(
            @RequestParam UUID userId,
            @PathVariable UUID audioCardId
    ) {
        return cardStackService.findAll(userId, audioCardId);
    }


    @PostMapping
    public List<CardStackResponse> add(
            @RequestParam UUID userId,
            @PathVariable UUID audioCardId,
            @Valid @RequestBody CardStackRequest request
    ) {
        return cardStackService.add(userId, audioCardId, request);
    }


    @DeleteMapping("/{stackId}")
    public void delete(
            @RequestParam UUID userId,
            @PathVariable UUID audioCardId,
            @PathVariable UUID stackId
    ) {
        cardStackService.delete(userId, audioCardId, stackId);
    }
}