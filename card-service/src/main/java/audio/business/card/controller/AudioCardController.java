package audio.business.card.controller;


import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;
import audio.business.card.dto.response.CardPhotoResponse;
import audio.business.card.dto.response.CardDocumentResponse;
import audio.business.card.service.interfaces.AudioCardService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

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

    @PostMapping("/{audioCardId}/publish")
    public AudioCardResponse publish(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId) {
        return audioCardService.publish(userId, audioCardId);
    }

    @DeleteMapping("/{audioCardId}/publication")
    public AudioCardResponse unpublish(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId) {
        return audioCardService.unpublish(userId, audioCardId);
    }

    @DeleteMapping("/{audioCardId}")
    public void delete(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID audioCardId) {
        audioCardService.delete(userId, audioCardId);
    }

    @PostMapping(value = "/{audioCardId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AudioCardResponse uploadPhoto(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return audioCardService.uploadPhoto(userId, audioCardId, file);
    }

    @GetMapping("/{audioCardId}/photo")
    public ResponseEntity<Resource> getPhoto(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId) throws IOException {
        CardPhotoResponse photo = audioCardService.getPhoto(userId, audioCardId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(photo.contentType()))
                .body(photo.resource());
    }

    @PostMapping(value = "/{audioCardId}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AudioCardResponse uploadDocument(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return audioCardService.uploadDocument(userId, audioCardId, file);
    }

    @GetMapping("/{audioCardId}/document")
    public ResponseEntity<Resource> getDocument(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId) throws IOException {
        return documentResponse(audioCardService.getDocument(userId, audioCardId), CacheControl.noStore());
    }

    @DeleteMapping("/{audioCardId}/document")
    public AudioCardResponse deleteDocument(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID audioCardId) {
        return audioCardService.deleteDocument(userId, audioCardId);
    }

    private ResponseEntity<Resource> documentResponse(CardDocumentResponse document, CacheControl cacheControl) {
        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .contentType(MediaType.parseMediaType(document.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(document.originalFilename(), StandardCharsets.UTF_8)
                        .build().toString())
                .body(document.resource());
    }
}
