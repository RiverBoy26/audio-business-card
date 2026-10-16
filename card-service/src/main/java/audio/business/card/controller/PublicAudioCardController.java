package audio.business.card.controller;

import audio.business.card.dto.response.CardPhotoResponse;
import audio.business.card.dto.response.CardDocumentResponse;
import audio.business.card.dto.response.PublicAudioCardResponse;
import audio.business.card.dto.response.PublicMediaResponse;
import audio.business.card.service.interfaces.AudioCardService;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/public/audio-cards")
public class PublicAudioCardController {
    private final AudioCardService audioCardService;

    public PublicAudioCardController(AudioCardService audioCardService) {
        this.audioCardService = audioCardService;
    }

    @GetMapping("/{audioCardId}")
    public ResponseEntity<PublicAudioCardResponse> findById(@PathVariable UUID audioCardId) {
        return publicCardResponse(audioCardService.findPublishedById(audioCardId));
    }

    @GetMapping("/code/{publicCode}")
    public ResponseEntity<PublicAudioCardResponse> findByCode(@PathVariable String publicCode) {
        return publicCardResponse(audioCardService.findPublishedByCode(publicCode));
    }

    @GetMapping("/{audioCardId}/photo")
    public ResponseEntity<Resource> getPhoto(@PathVariable UUID audioCardId) throws IOException {
        CardPhotoResponse photo = audioCardService.getPublishedPhoto(audioCardId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(photo.contentType()))
                .body(photo.resource());
    }

    @GetMapping("/{audioCardId}/document")
    public ResponseEntity<Resource> getDocument(@PathVariable UUID audioCardId) throws IOException {
        CardDocumentResponse document = audioCardService.getPublishedDocument(audioCardId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(document.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(document.originalFilename(), StandardCharsets.UTF_8)
                        .build().toString())
                .body(document.resource());
    }

    @GetMapping("/{audioCardId}/voice")
    public ResponseEntity<byte[]> getVoice(@PathVariable UUID audioCardId) {
        return mediaResponse(audioCardService.getPublishedVoice(audioCardId));
    }

    @GetMapping("/{audioCardId}/music")
    public ResponseEntity<byte[]> getMusic(@PathVariable UUID audioCardId) {
        return mediaResponse(audioCardService.getPublishedMusic(audioCardId));
    }

    private ResponseEntity<byte[]> mediaResponse(PublicMediaResponse media) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(media.contentType()))
                .body(media.content());
    }

    private ResponseEntity<PublicAudioCardResponse> publicCardResponse(PublicAudioCardResponse card) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(card);
    }
}
