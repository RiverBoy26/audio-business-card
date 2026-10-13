package audio.business.card.controller;

import audio.business.card.entity.CardSettings;
import audio.business.card.service.CardSettingsService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/audio-cards/{audioCardId}/settings")
public class CardSettingController {
    private CardSettingsService cardSettingsService;

    public CardSettingController(CardSettingsService cardSettingsService) {
        this.cardSettingsService = cardSettingsService;
    }

    @GetMapping
    public CardSettings findByAudioCardId(@RequestParam UUID userId,
                                          @PathVariable UUID audioCardId) {
        return cardSettingsService.findByAudioCardId(userId, audioCardId);
    }

    @PatchMapping
    public CardSettings update(@RequestParam UUID userId,
                               @PathVariable UUID audioCardId,
                               @RequestBody CardSettings newCardSettings) {
        return cardSettingsService.update(userId, audioCardId, newCardSettings);
    }
}
