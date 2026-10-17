package audio.business.hackatonservice.controller;

import audio.business.hackatonservice.dto.*;
import audio.business.hackatonservice.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import audio.business.hackatonservice.service.CardClient;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService service;

    @GetMapping("/mine")
    public List<ApplicationResponse> mine(@RequestHeader("X-Authenticated-User-Id") UUID userId) {
        return service.findMine(userId);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse decide(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationStatusRequest request) {
        return service.decide(userId, id, request);
    }

    @PostMapping("/{id}/withdraw")
    public ApplicationResponse withdraw(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID id) {
        return service.withdraw(userId, id);
    }

    @GetMapping("/{id}/card")
    public CardClient.SharedCard card(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID id) {
        return service.findCard(userId, id);
    }

    @GetMapping("/{id}/card/{media}")
    public ResponseEntity<byte[]> cardMedia(@RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID id, @PathVariable String media) {
        CardClient.CardMedia value = service.findCardMedia(userId, id, media);
        ResponseEntity.BodyBuilder response = ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .contentType(value.contentType() == null ? MediaType.APPLICATION_OCTET_STREAM : value.contentType());
        if (value.contentDisposition() != null) response.header(HttpHeaders.CONTENT_DISPOSITION, value.contentDisposition());
        return response.body(value.content());
    }
}
