package audio.business.card.controller;

import audio.business.card.dto.response.CardSettingResponse;
import audio.business.card.dto.request.CardSettingsRequest;
import audio.business.card.service.interfaces.CardSettingsService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/audio-cards/{audioCardId}/settings")
public class CardSettingController {
    private final CardSettingsService cardSettingsService;

    public CardSettingController(CardSettingsService cardSettingsService) {
        this.cardSettingsService = cardSettingsService;
    }

    @GetMapping
    public CardSettingResponse findByAudioCardId(@RequestParam UUID userId,
                                                 @PathVariable UUID audioCardId) {
        return cardSettingsService.findByAudioCardId(userId, audioCardId);
    }

    @PatchMapping
    public CardSettingResponse update(@RequestParam UUID userId,
                               @PathVariable UUID audioCardId,
                               @RequestBody CardSettingsRequest newCardSettings) {
        return cardSettingsService.update(userId, audioCardId, newCardSettings);
    }
}
