package audio.business.sound.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class MusicStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("mp3", "wav", "ogg", "m4a", "aac");

    private final Path storageDirectory;
    private final String configuredStorageDirectory;

    public MusicStorageService(
            @Value("${app.music.storage-dir:uploads/music}")
            String storageDirectory) {

        this.configuredStorageDirectory = storageDirectory;

        this.storageDirectory = Path.of(storageDirectory)
                .toAbsolutePath()
                .normalize();
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Музыкальный файл пуст");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename()
        );

        String extension = getExtension(originalName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Поддерживаются форматы MP3, WAV, OGG, M4A и AAC");
        }

        Files.createDirectories(storageDirectory);

        String storedFilename = UUID.randomUUID()
                + "." + extension;

        Path target = storageDirectory
                .resolve(storedFilename)
                .normalize();

        if (!target.startsWith(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Недопустимое имя файла");
        }

        Files.copy(file.getInputStream(), target);

        return storedFilename;
    }

    public Resource load(String storedFilename)
            throws IOException {

        Path filePath = storageDirectory
                .resolve(storedFilename)
                .normalize();

        if (!filePath.startsWith(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Недопустимый путь к файлу");
        }

        Resource resource = new UrlResource(
                filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new NoSuchFileException(storedFilename);
        }

        return resource;
    }

    public void delete(String storedFilename)
            throws IOException {

        Path filePath = storageDirectory
                .resolve(storedFilename)
                .normalize();

        if (!filePath.startsWith(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Недопустимый путь к файлу");
        }

        Files.deleteIfExists(filePath);
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');

        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }

        return filename.substring(dotIndex + 1)
                .toLowerCase(Locale.ROOT);
    }

    public String getStoragePath(String storedFilename) {
        return Path.of(configuredStorageDirectory)
                .resolve(storedFilename)
                .normalize()
                .toString();
    }
}