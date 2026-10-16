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
import java.util.UUID;

@Service
public class CardDocumentStorageService {
    private static final long MAX_SIZE = 10L * 1024 * 1024;
    private final Path directory;

    public CardDocumentStorageService(@Value("${app.card-document.storage-dir:uploads/card-documents}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
    }

    public StoredDocument store(MultipartFile file) throws IOException {
        String originalName = validate(file);
        Files.createDirectories(directory);
        String filename = UUID.randomUUID() + ".pdf";
        Files.copy(file.getInputStream(), resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return new StoredDocument(filename, originalName);
    }

    public Resource load(String filename) throws IOException {
        Resource resource = new UrlResource(resolve(filename).toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF-файл не найден");
        }
        return resource;
    }

    public void delete(String filename) {
        if (filename == null) return;
        try { Files.deleteIfExists(resolve(filename)); } catch (IOException ignored) { }
    }

    private String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF-файл пуст");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Размер PDF-файла не должен превышать 10 МБ");
        }
        String name = StringUtils.cleanPath(file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename());
        if (name.contains("..") || !name.toLowerCase(Locale.ROOT).endsWith(".pdf")
                || !"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Поддерживаются только PDF-файлы");
        }
        return name;
    }

    private Path resolve(String filename) {
        Path path = directory.resolve(filename).normalize();
        if (!path.startsWith(directory)) throw new IllegalArgumentException("Недопустимый путь");
        return path;
    }

    public record StoredDocument(String filename, String originalFilename) { }
}
