package audio.business.card.controller;

import audio.business.card.dto.response.CardDocumentResponse;
import audio.business.card.dto.response.CardPhotoResponse;
import audio.business.card.dto.response.PublicAudioCardResponse;
import audio.business.card.dto.response.PublicMediaResponse;
import audio.business.card.service.interfaces.AudioCardService;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/internal/audio-cards")
public class InternalAudioCardController {
    private final AudioCardService service;

    public InternalAudioCardController(AudioCardService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicAudioCardResponse> card(@PathVariable UUID id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.findSharedById(id));
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<Resource> photo(@PathVariable UUID id) throws IOException {
        CardPhotoResponse photo = service.getSharedPhoto(id);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(photo.contentType())).body(photo.resource());
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<Resource> document(@PathVariable UUID id) throws IOException {
        CardDocumentResponse document = service.getSharedDocument(id);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(document.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(document.originalFilename(), StandardCharsets.UTF_8).build().toString())
                .body(document.resource());
    }

    @GetMapping("/{id}/voice")
    public ResponseEntity<byte[]> voice(@PathVariable UUID id) {
        return media(service.getSharedVoice(id));
    }

    @GetMapping("/{id}/music")
    public ResponseEntity<byte[]> music(@PathVariable UUID id) {
        return media(service.getSharedMusic(id));
    }

    private ResponseEntity<byte[]> media(PublicMediaResponse media) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(media.contentType())).body(media.content());
    }
}
