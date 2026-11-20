package audio.business.card.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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
import java.util.Map;
import java.util.UUID;

@Service
public class CardImageStorageService {
    private static final long MAX_SIZE = 5L * 1024 * 1024;
    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "jpg", "image/jpeg", "jpeg", "image/jpeg",
            "png", "image/png", "webp", "image/webp"
    );
    private final Path directory;

    public CardImageStorageService(@Value("${app.card-image.storage-dir:uploads/card-images}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
    }

    public StoredImage store(MultipartFile file) throws IOException {
        String extension = validate(file);
        Files.createDirectories(directory);
        String filename = UUID.randomUUID() + "." + extension;
        Files.copy(file.getInputStream(), resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return new StoredImage(filename, CONTENT_TYPES.get(extension));
    }

    public Resource load(String filename) throws IOException {
        Resource resource = new UrlResource(resolve(filename).toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Фотография не найдена");
        }
        return resource;
    }

    public void delete(String filename) {
        if (filename == null) return;
        try { Files.deleteIfExists(resolve(filename)); } catch (IOException ignored) { }
    }

    private String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Файл изображения пуст");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Размер изображения не должен превышать 5 МБ");
        }
        String name = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        int dot = name.lastIndexOf('.');
        String extension = dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
        String expectedType = CONTENT_TYPES.get(extension);
        if (expectedType == null || file.getContentType() == null || !expectedType.equalsIgnoreCase(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Поддерживаются JPG, PNG и WEBP");
        }
        return extension;
    }

    private Path resolve(String filename) {
        Path path = directory.resolve(filename).normalize();
        if (!path.startsWith(directory)) throw new IllegalArgumentException("Недопустимый путь");
        return path;
    }

    public record StoredImage(String filename, String contentType) { }
}
