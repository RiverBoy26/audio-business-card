package audio.business.sound.dto;

import audio.business.sound.model.VoiceRecording;

import java.time.LocalDateTime;
import java.util.UUID;

public record VoiceRecordingResponse(
        UUID id,
        String originalFilename,
        String contentType,
        long size,
        int durationSeconds,
        String processingStatus,
        LocalDateTime createdAt,
        String fileUrl
) {
    public static VoiceRecordingResponse from(VoiceRecording recording) {
        return new VoiceRecordingResponse(
                recording.getId(), recording.getOriginalFilename(), recording.getContentType(),
                recording.getSize(), recording.getDurationSeconds(), recording.getProcessingStatus(),
                recording.getCreatedAt(), "/api/voice-recordings/" + recording.getId() + "/file");
    }
}
