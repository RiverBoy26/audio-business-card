package audio.business.sound.service;

import audio.business.sound.dto.VoiceRecordingResponse;
import audio.business.sound.model.VoiceRecording;
import audio.business.sound.repository.VoiceRecordingRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class VoiceRecordingService {
    private final VoiceRecordingRepository repository;
    private final VoiceRecordingStorageService storage;

    public VoiceRecordingService(
            VoiceRecordingRepository repository,
            VoiceRecordingStorageService storage
    ) {
        this.repository = repository;
        this.storage = storage;
    }

    public VoiceRecordingResponse upload(MultipartFile file, int durationSeconds, UUID userId) throws IOException {
        if (durationSeconds < 0 || durationSeconds > 1800) throw new IllegalArgumentException("Некорректная длительность записи");
        String storedFilename = storage.store(file);
        try {
            VoiceRecording recording = new VoiceRecording();
            recording.setId(UUID.randomUUID());
            recording.setUserId(userId);
            recording.setOriginalFilename(file.getOriginalFilename() == null ? "voice-recording" : file.getOriginalFilename());
            recording.setStoredFilename(storedFilename);
            recording.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
            recording.setSize(file.getSize());
            recording.setDurationSeconds(durationSeconds);
            recording.setProcessingStatus("READY");
            recording.setCreatedAt(LocalDateTime.now());
            return VoiceRecordingResponse.from(repository.save(recording));
        } catch (RuntimeException exception) {
            storage.delete(storedFilename);
            throw exception;
        }
    }

    public List<VoiceRecordingResponse> getByUserId(UUID userId) {
        return repository.findAllByUserIdOrderByCreatedAtDesc(userId).stream().map(VoiceRecordingResponse::from).toList();
    }

    public VoiceRecording getOwned(UUID id, UUID userId) {
        VoiceRecording recording = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Запись не найдена"));
        if (!userId.equals(recording.getUserId())) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Запись не найдена");
        return recording;
    }

    public Resource getFile(UUID id, UUID userId) throws IOException {
        return storage.load(getOwned(id, userId).getStoredFilename());
    }

    @Transactional
    public void delete(UUID id, UUID userId) throws IOException {
        VoiceRecording recording = getOwned(id, userId);
        storage.delete(recording.getStoredFilename());
        repository.delete(recording);
    }
}
