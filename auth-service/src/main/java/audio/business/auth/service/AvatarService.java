package audio.business.auth.service;

import audio.business.auth.dto.UserResponse;
import audio.business.auth.entity.User;
import audio.business.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
public class AvatarService {
    private static final long MAX_SIZE = 5L * 1024 * 1024;
    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "jpg", "image/jpeg", "jpeg", "image/jpeg",
            "png", "image/png", "webp", "image/webp"
    );

    private final UserRepository userRepository;
    private final Path storageDirectory;

    public AvatarService(UserRepository userRepository,
                         @Value("${app.avatar.storage-dir:uploads/avatars}") String storageDirectory) {
        this.userRepository = userRepository;
        this.storageDirectory = Path.of(storageDirectory).toAbsolutePath().normalize();
    }

    @Transactional
    public UserResponse upload(UUID userId, MultipartFile file) throws IOException {
        User user = findUser(userId);
        String extension = validate(file);
        Files.createDirectories(storageDirectory);

        String filename = UUID.randomUUID() + "." + extension;
        Path target = resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        String previous = user.getAvatarFilename();

        try {
            user.setAvatarFilename(filename);
            user.setAvatarContentType(CONTENT_TYPES.get(extension));
            UserResponse response = UserResponse.from(userRepository.save(user));
            deleteQuietly(previous);
            return response;
        } catch (RuntimeException exception) {
            deleteQuietly(filename);
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public AvatarContent load(UUID userId) throws IOException {
        User user = findUser(userId);
        if (user.getAvatarFilename() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Аватар не найден");
        }

        Resource resource = new UrlResource(resolve(user.getAvatarFilename()).toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Аватар не найден");
        }
        return new AvatarContent(resource, user.getAvatarContentType());
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
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
        Path path = storageDirectory.resolve(filename).normalize();
        if (!path.startsWith(storageDirectory)) throw new IllegalArgumentException("Недопустимый путь");
        return path;
    }

    private void deleteQuietly(String filename) {
        if (filename == null) return;
        try { Files.deleteIfExists(resolve(filename)); } catch (IOException ignored) { }
    }

    public record AvatarContent(Resource resource, String contentType) { }
}
