package audio.business.sound.service;

import audio.business.sound.dto.MusicResponse;
import audio.business.sound.model.MusicFile;
import audio.business.sound.repository.MusicRepository;
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
public class MusicService {

    private final MusicRepository musicRepository;
    private final MusicStorageService storageService;

    public MusicService(MusicRepository musicRepository, MusicStorageService storageService) {
        this.musicRepository = musicRepository;
        this.storageService = storageService;
    }

    public MusicResponse upload(MultipartFile file, UUID userId) throws IOException {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "Не указан ID пользователя");
        }

        String storedFilename = storageService.store(file);

        try {
            MusicFile music = new MusicFile();
            music.setId(UUID.randomUUID());
            music.setUserId(userId);
            music.setOriginalFilename(file.getOriginalFilename());
            music.setStoredFilename(storedFilename);
            music.setStoragePath(
                    storageService.getStoragePath(storedFilename));
            music.setContentType(
                    detectContentType(storedFilename));
            music.setSize(file.getSize());
            music.setUploadedAt(LocalDateTime.now());

            return MusicResponse.from(
                    musicRepository.save(music));

        } catch (RuntimeException exception) {
            storageService.delete(storedFilename);
            throw exception;
        }
    }

    public List<MusicResponse> getAll() {
        return musicRepository.findAll()
                .stream()
                .map(MusicResponse::from)
                .toList();
    }

    public List<MusicResponse> getByUserId(UUID userId) {
        return musicRepository.findAllByUserId(userId)
                .stream()
                .map(MusicResponse::from)
                .toList();
    }

    public MusicFile getById(UUID id) {
        return musicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Музыкальный файл не найден"));
    }

    public Resource getFile(UUID id) throws IOException {
        MusicFile music = getById(id);
        return storageService.load(music.getStoredFilename());
    }

    @Transactional
    public void delete(UUID id) throws IOException {
        MusicFile music = getById(id);

        storageService.delete(music.getStoredFilename());
        musicRepository.delete(music);
    }

    private String detectContentType(String filename) {
        String extension = filename.substring(
                filename.lastIndexOf('.') + 1);

        return switch (extension.toLowerCase()) {
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            case "ogg" -> "audio/ogg";
            case "m4a" -> "audio/mp4";
            case "aac" -> "audio/aac";
            default -> "application/octet-stream";
        };
    }
}