package audio.business.card.mapper;

import audio.business.card.dto.request.CardSettingsRequest;
import audio.business.card.dto.response.CardSettingResponse;
import audio.business.card.entity.CardSettings;

public class CardSettingsMapper {
    public static CardSettingResponse toResponse(CardSettings cardSettings) {
        CardSettingResponse cardSettingResponse = new CardSettingResponse();

        cardSettingResponse.setCardId(cardSettings.getCardId());
        cardSettingResponse.setVoiceVolume(cardSettings.getVoiceVolume());
        cardSettingResponse.setMusicVolume(cardSettings.getMusicVolume());
        cardSettingResponse.setMusicStartSeconds(cardSettings.getMusicStartSeconds());

        return cardSettingResponse;
    }

    public  static CardSettings toEntity(CardSettingsRequest cardSettingsRequest) {
        CardSettings cardSettings = new CardSettings();

        cardSettings.setVoiceVolume(cardSettingsRequest.getVoiceVolume());
        cardSettings.setMusicVolume(cardSettingsRequest.getMusicVolume());
        cardSettings.setMusicStartSeconds(cardSettingsRequest.getMusicStartSeconds());

        return cardSettings;
    }
}
