package audio.business.sound.controller;

import audio.business.sound.dto.MusicResponse;
import audio.business.sound.model.MusicFile;
import audio.business.sound.service.MusicService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/music")
public class MusicController {

    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @PostMapping("/upload")
    public ResponseEntity<MusicResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-Authenticated-User-Id") UUID userId)
            throws IOException {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(musicService.upload(file, userId));
    }

    @GetMapping
    public List<MusicResponse> getAll(@RequestHeader("X-Authenticated-User-Id") UUID userId) {
        return musicService.getByUserId(userId);
    }

    @GetMapping("/user/{userId}")
    public List<MusicResponse> getByUserId(
            @PathVariable UUID userId,
            @RequestHeader("X-Authenticated-User-Id") UUID currentUserId) {
        if (!userId.equals(currentUserId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Доступ к чужой музыке запрещён"
            );
        }

        return musicService.getByUserId(userId);
    }

    @GetMapping("/{id}")
    public MusicResponse getById(@PathVariable UUID id, @RequestHeader("X-Authenticated-User-Id") UUID userId) {
        return MusicResponse.from(musicService.getAccessibleById(id, userId));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getFile(
            @PathVariable UUID id, @RequestHeader("X-Authenticated-User-Id") UUID userId) throws IOException {

        MusicFile music = musicService.getAccessibleById(id, userId);
        Resource resource = musicService.getFile(id, userId);

        ContentDisposition disposition =
                ContentDisposition.inline()
                        .filename(
                                music.getOriginalFilename(),
                                StandardCharsets.UTF_8)
                        .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        music.getContentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString())
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id, @RequestHeader("X-Authenticated-User-Id") UUID userId) throws IOException {

        musicService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(
            IllegalArgumentException exception) {

        return ResponseEntity.badRequest()
                .body(exception.getMessage());
    }
}
