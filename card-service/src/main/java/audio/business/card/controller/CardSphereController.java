package audio.business.card.controller;

import audio.business.card.dto.request.CardSphereRequest;
import audio.business.card.dto.response.CardSphereResponse;

import audio.business.card.service.interfaces.CardSphereService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/audio-cards/{audioCardId}/spheres")
public class CardSphereController {

    private final CardSphereService cardSphereService;

    public CardSphereController(CardSphereService cardSphereService) {
        this.cardSphereService = cardSphereService;
    }

    @GetMapping
    public List<CardSphereResponse> findAll(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId
    ) {
        return cardSphereService.findAll(userId, audioCardId);
    }


    @PostMapping
    public List<CardSphereResponse> add(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId,
            @Valid @RequestBody CardSphereRequest request
    ) {
        return cardSphereService.add(userId, audioCardId, request);
    }


    @DeleteMapping("/{sphereId}")
    public void delete(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId,
            @PathVariable UUID sphereId
    ) {
        cardSphereService.delete(userId, audioCardId, sphereId);
    }
}