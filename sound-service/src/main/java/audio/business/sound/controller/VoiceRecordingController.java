package audio.business.sound.controller;

import audio.business.sound.dto.VoiceRecordingResponse;
import audio.business.sound.model.VoiceRecording;
import audio.business.sound.service.VoiceRecordingService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/voice-recordings")
public class VoiceRecordingController {
    private final VoiceRecordingService service;

    public VoiceRecordingController(VoiceRecordingService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<VoiceRecordingResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "durationSeconds", defaultValue = "0") int durationSeconds,
            @RequestHeader("X-Authenticated-User-Id") UUID userId) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.upload(file, durationSeconds, userId));
    }

    @GetMapping
    public List<VoiceRecordingResponse> getAll(@RequestHeader("X-Authenticated-User-Id") UUID userId) {
        return service.getByUserId(userId);
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getFile(@PathVariable UUID id, @RequestHeader("X-Authenticated-User-Id") UUID userId) throws IOException {
        VoiceRecording recording = service.getOwned(id, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(recording.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(recording.getOriginalFilename(), StandardCharsets.UTF_8).build().toString())
                .body(service.getFile(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestHeader("X-Authenticated-User-Id") UUID userId) throws IOException {
        service.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
