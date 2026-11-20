package audio.business.sound.service;

import audio.business.sound.voice.VoiceProfile;
import audio.business.sound.voice.VoiceProfileService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;

@Service
public class VoiceProfileProcessingService {
    private static final long MAX_SIZE = 25L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("wav", "webm", "ogg", "mp3", "m4a", "aac");
    private final ObjectProvider<VoiceProfileService> profileServiceProvider;

    public VoiceProfileProcessingService(ObjectProvider<VoiceProfileService> profileServiceProvider) {
        this.profileServiceProvider = profileServiceProvider;
    }

    public VoiceProfile process(MultipartFile file) {
        String extension = validate(file);
        VoiceProfileService profileService = profileServiceProvider.getIfAvailable();
        if (profileService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Модель распознавания не настроена на сервере");
        }

        Path temporary = null;
        try {
            temporary = Files.createTempFile("voice-profile-", "." + extension);
            Files.copy(file.getInputStream(), temporary, StandardCopyOption.REPLACE_EXISTING);
            return profileService.extract(temporary);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception | LinkageError exception) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Не удалось распознать голосовое сообщение", exception);
        } finally {
            if (temporary != null) {
                try { Files.deleteIfExists(temporary); } catch (IOException ignored) { }
            }
        }
    }

    private String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Голосовое сообщение пустое");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Размер записи не должен превышать 25 МБ");
        }
        String name = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        int dot = name.lastIndexOf('.');
        String extension = dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (name.contains("..") || !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Поддерживаются WAV, WEBM, OGG, MP3, M4A и AAC");
        }
        return extension;
    }
}
