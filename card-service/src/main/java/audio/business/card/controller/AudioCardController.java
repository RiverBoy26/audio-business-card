package audio.business.card.controller;


import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;
import audio.business.card.service.interfaces.AudioCardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/audio-cards")
public class AudioCardController {
    private final AudioCardService audioCardService;

    public AudioCardController(AudioCardService audioCardService) {
        this.audioCardService = audioCardService;
    }

    @GetMapping
    public List<AudioCardResponse> findAll(@RequestHeader("X-Authenticated-User-Id") UUID userId) {
        return audioCardService.findAllByUserId(userId);
    }

    @GetMapping("/{audioCardId}")
    public AudioCardResponse findById(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID audioCardId) {
        return audioCardService.findById(userId, audioCardId);
    }

    @PostMapping()
    public AudioCardResponse create(@RequestHeader("X-Authenticated-User-Id") UUID userId, @RequestBody AudioCardRequest audioCard) {
        return audioCardService.create(userId, audioCard);
    }

    @PatchMapping("/{audioCardId}")
    public AudioCardResponse update(@RequestHeader("X-Authenticated-User-Id") UUID userId,
                       @PathVariable UUID audioCardId,
                       @RequestBody AudioCardRequest newAudioCard) {
        return audioCardService.update(userId, audioCardId, newAudioCard);
    }

    @DeleteMapping("/{audioCardId}")
    public void delete(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID audioCardId) {
        audioCardService.delete(userId, audioCardId);
    }
}
