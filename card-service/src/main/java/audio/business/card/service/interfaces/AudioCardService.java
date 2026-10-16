package audio.business.card.service.interfaces;

import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;
import audio.business.card.dto.response.CardPhotoResponse;
import audio.business.card.dto.response.CardDocumentResponse;
import audio.business.card.dto.response.PublicAudioCardResponse;
import audio.business.card.dto.response.PublicMediaResponse;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;
import java.util.UUID;

public interface AudioCardService {
    List<AudioCardResponse> findAllByUserId(UUID userId);

    AudioCardResponse findById(UUID userId, UUID audioCardId);

    AudioCardResponse create(UUID userId, AudioCardRequest audioCard);

    AudioCardResponse update(UUID userId, UUID audioCardId, AudioCardRequest newAudioCard);

    AudioCardResponse publish(UUID userId, UUID audioCardId);

    AudioCardResponse unpublish(UUID userId, UUID audioCardId);

    PublicAudioCardResponse findPublishedById(UUID audioCardId);

    PublicAudioCardResponse findPublishedByCode(String publicCode);

    void delete(UUID userId, UUID audioCardId);

    AudioCardResponse uploadPhoto(UUID userId, UUID audioCardId, MultipartFile file) throws IOException;

    CardPhotoResponse getPhoto(UUID userId, UUID audioCardId) throws IOException;

    CardPhotoResponse getPublishedPhoto(UUID audioCardId) throws IOException;

    AudioCardResponse uploadDocument(UUID userId, UUID audioCardId, MultipartFile file) throws IOException;

    CardDocumentResponse getDocument(UUID userId, UUID audioCardId) throws IOException;

    CardDocumentResponse getPublishedDocument(UUID audioCardId) throws IOException;

    AudioCardResponse deleteDocument(UUID userId, UUID audioCardId);

    PublicMediaResponse getPublishedVoice(UUID audioCardId);

    PublicMediaResponse getPublishedMusic(UUID audioCardId);
}
