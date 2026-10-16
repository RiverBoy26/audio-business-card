package audio.business.sound.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class VoiceRecordingStorageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("webm", "ogg", "wav", "m4a", "aac", "mp3");
    private final Path storageDirectory;

    public VoiceRecordingStorageService(@Value("${app.voice.storage-dir:uploads/voice}") String storageDirectory) {
        this.storageDirectory = Path.of(storageDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Запись пуста");
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        int dotIndex = originalName.lastIndexOf('.');
        String extension = dotIndex < 0 ? "" : originalName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) throw new IllegalArgumentException("Поддерживаются WEBM, OGG, WAV, M4A, AAC и MP3");
        Files.createDirectories(storageDirectory);
        String storedFilename = UUID.randomUUID() + "." + extension;
        Path target = storageDirectory.resolve(storedFilename).normalize();
        if (!target.startsWith(storageDirectory)) throw new IllegalArgumentException("Недопустимое имя файла");
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return storedFilename;
    }

    public String store(Path source, String extension) throws IOException {
        String normalizedExtension = extension == null ? "" : extension.toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(normalizedExtension)) {
            throw new IllegalArgumentException("Неподдерживаемый формат записи");
        }
        if (!Files.isRegularFile(source) || Files.size(source) == 0) {
            throw new IllegalArgumentException("Запись пуста");
        }
        Files.createDirectories(storageDirectory);
        String storedFilename = UUID.randomUUID() + "." + normalizedExtension;
        Path target = storageDirectory.resolve(storedFilename).normalize();
        if (!target.startsWith(storageDirectory)) throw new IllegalArgumentException("Недопустимое имя файла");
        Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
        return storedFilename;
    }

    public Resource load(String storedFilename) throws IOException {
        Path path = storageDirectory.resolve(storedFilename).normalize();
        if (!path.startsWith(storageDirectory)) throw new IllegalArgumentException("Недопустимый путь к файлу");
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) throw new NoSuchFileException(storedFilename);
        return resource;
    }

    public void delete(String storedFilename) throws IOException {
        Path path = storageDirectory.resolve(storedFilename).normalize();
        if (!path.startsWith(storageDirectory)) throw new IllegalArgumentException("Недопустимый путь к файлу");
        Files.deleteIfExists(path);
    }
}
