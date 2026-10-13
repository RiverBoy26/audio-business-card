package audio.business.card.controller;


import audio.business.card.entity.AudioCard;
import audio.business.card.service.AudioCardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/audio-cards")
public class AudioCardController {
    private AudioCardService audioCardService;

    public AudioCardController(AudioCardService audioCardService) {
        this.audioCardService = audioCardService;
    }

    @GetMapping
    public List<AudioCard> findAll(@RequestParam UUID userId) {
        return audioCardService.findAllByUserId(userId);
    }

    @GetMapping("/{audioCardId}")
    public AudioCard findById(@PathVariable UUID audioCardId) {
        return audioCardService.findById(audioCardId);
    }

    @PostMapping()
    public UUID create(@RequestParam UUID userId, @RequestBody AudioCard audioCard) {
        return audioCardService.create(userId, audioCard);
    }

    @PatchMapping("/{audioCardId}")
    public UUID update(@RequestParam UUID userId,
                       @PathVariable UUID audioCardId,
                       @RequestBody AudioCard newAudioCard) {
        return audioCardService.update(userId, audioCardId, newAudioCard);
    }

    @DeleteMapping("/{audioCardId}")
    public UUID delete(@RequestParam UUID userId, @PathVariable UUID audioCardId) {
        return audioCardService.delete(userId, audioCardId);
    }
}
