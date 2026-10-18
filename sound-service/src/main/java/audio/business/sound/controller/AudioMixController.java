package audio.business.sound.controller;

import audio.business.sound.service.AudioMixService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/audio")
public class AudioMixController {

    private final AudioMixService audioMixService;

    public AudioMixController(AudioMixService audioMixService) {
        this.audioMixService = audioMixService;
    }

    @PostMapping(
            value = "/mix",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Resource> mixAudio(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @RequestParam("voiceFile") MultipartFile voiceFile,
            @RequestParam("musicId") UUID musicId,
            @RequestParam(defaultValue = "100") int voiceVolume,
            @RequestParam(defaultValue = "100") int musicVolume
    ) throws IOException {

        Path mixedFile = audioMixService.mix(
                voiceFile,
                musicId,
                userId,
                voiceVolume,
                musicVolume
        );

        Resource resource = new FileSystemResource(mixedFile);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename("audio-card.mp3")
                                .build()
                                .toString()
                )
                .body(resource);
    }
}
