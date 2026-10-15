package audio.business.sound.dto;

import audio.business.sound.model.MusicFile;

import java.time.LocalDateTime;
import java.util.UUID;

public record MusicResponse(
        UUID id,
        UUID userId,
        String originalFilename,
        String contentType,
        long size,
        LocalDateTime uploadedAt,
        String fileUrl
) {
    public static MusicResponse from(MusicFile music) {
        return new MusicResponse(
                music.getId(),
                music.getUserId(),
                music.getOriginalFilename(),
                music.getContentType(),
                music.getSize(),
                music.getUploadedAt(),
                "/api/music/" + music.getId() + "/file"
        );
    }
}