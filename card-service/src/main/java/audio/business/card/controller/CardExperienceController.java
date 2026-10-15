package audio.business.card.controller;

import audio.business.card.dto.request.CardExperienceRequest;
import audio.business.card.dto.response.CardExperienceResponse;

import audio.business.card.service.interfaces.CardExperienceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/audio-cards/{audioCardId}/experience")
public class CardExperienceController {

    private final CardExperienceService cardExperienceService;

    public CardExperienceController(
            CardExperienceService cardExperienceService
    ) {
        this.cardExperienceService = cardExperienceService;
    }

    @GetMapping
    public CardExperienceResponse findByAudioCardId(
            @RequestParam UUID userId,
            @PathVariable UUID audioCardId
    ) {
        return cardExperienceService.findByAudioCardId(userId, audioCardId);
    }

    @PutMapping
    public CardExperienceResponse update(
            @RequestParam UUID userId,
            @PathVariable UUID audioCardId,
            @Valid @RequestBody CardExperienceRequest request
    ) {
        return cardExperienceService.update(userId, audioCardId, request);
    }
}