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
            @RequestParam("userId") UUID userId)
            throws IOException {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(musicService.upload(file, userId));
    }

    @GetMapping
    public List<MusicResponse> getAll() {
        return musicService.getAll();
    }

    @GetMapping("/user/{userId}")
    public List<MusicResponse> getByUserId(
            @PathVariable UUID userId) {
        return musicService.getByUserId(userId);
    }

    @GetMapping("/{id}")
    public MusicResponse getById(@PathVariable UUID id) {
        return MusicResponse.from(musicService.getById(id));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getFile(
            @PathVariable UUID id) throws IOException {

        MusicFile music = musicService.getById(id);
        Resource resource = musicService.getFile(id);

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
            @PathVariable UUID id) throws IOException {

        musicService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(
            IllegalArgumentException exception) {

        return ResponseEntity.badRequest()
                .body(exception.getMessage());
    }
}