
package audio.business.card.mapper;

import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;
import audio.business.card.entity.AudioCard;

public class AudioCardMapper {

    public static AudioCardResponse toResponse(AudioCard card) {
        AudioCardResponse response = new AudioCardResponse();

        response.setId(card.getId());
        response.setTitle(card.getTitle());
        response.setFullName(card.getFullName());
        response.setContactEmail(card.getContactEmail());
        response.setContactPhone(card.getContactPhone());
        response.setDescription(card.getDescription());
        response.setPhotoUrl(card.getPhotoUrl());
        response.setDocumentName(card.getDocumentOriginalName());
        response.setDocumentUrl(card.getDocumentFilename() == null ? null : "/audio-cards/" + card.getId() + "/document");
        response.setCardType(card.getCardType());
        response.setSkills(card.getSkills());
        response.setMusicId(card.getMusicId());
        response.setVoiceRecordingId(card.getVoiceRecordingId());
        response.setPublished(card.isPublished());
        response.setPublishedAt(card.getPublishedAt());
        response.setPublicCode(card.getPublicCode());
        response.setDesiredPosition(card.getDesiredPosition());


        return response;
    }

    public static AudioCard toEntity(AudioCardRequest request) {
        AudioCard card = new AudioCard();

        card.setTitle(request.getTitle());
        card.setFullName(request.getFullName());
        card.setContactEmail(request.getContactEmail());
        card.setContactPhone(request.getContactPhone());
        card.setDescription(request.getDescription());
        card.setPhotoUrl(request.getPhotoUrl());
        card.setCardType(request.getCardType());
        card.setMusicId(request.getMusicId());
        card.setVoiceRecordingId(request.getVoiceRecordingId());
        if (request.getSkills() != null) {
            card.setSkills(request.getSkills());
        }
        card.setDesiredPosition(request.getDesiredPosition());

        return card;
    }
}
