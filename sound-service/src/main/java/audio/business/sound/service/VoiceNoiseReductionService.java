package audio.business.sound.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class VoiceNoiseReductionService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("webm", "ogg", "wav", "m4a", "aac", "mp3");
    private static final String FILTER = "highpass=f=70,afftdn=nr=8:nf=-45:tn=1,alimiter=limit=0.95";
    private final String ffmpegPath;

    public VoiceNoiseReductionService(@Value("${app.ffmpeg.path:ffmpeg}") String ffmpegPath) {
        this.ffmpegPath = ffmpegPath;
    }

    public ProcessedRecording reduce(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Запись пуста");

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        int dotIndex = originalName.lastIndexOf('.');
        String extension = dotIndex < 0 ? "" : originalName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Поддерживаются WEBM, OGG, WAV, M4A, AAC и MP3");
        }

        String baseName = dotIndex > 0 ? originalName.substring(0, dotIndex) : "voice-recording";
        if (baseName.isBlank()) baseName = "voice-recording";

        Path workDirectory = Files.createTempDirectory("voice-noise-reduction-");
        Path input = workDirectory.resolve("input." + extension);
        Path output = workDirectory.resolve("output.webm");
        Path log = workDirectory.resolve("ffmpeg.log");

        try {
            file.transferTo(input);
            Process process = new ProcessBuilder(
                    ffmpegPath,
                    "-nostdin",
                    "-hide_banner",
                    "-loglevel", "error",
                    "-y",
                    "-i", input.toString(),
                    "-vn",
                    "-af", FILTER,
                    "-ac", "1",
                    "-ar", "48000",
                    "-c:a", "libopus",
                    "-b:a", "96k",
                    "-f", "webm",
                    output.toString()
            ).redirectErrorStream(true).redirectOutput(log.toFile()).start();

            boolean completed;
            try {
                completed = process.waitFor(2, TimeUnit.MINUTES);
            } catch (InterruptedException exception) {
                process.destroyForcibly();
                Thread.currentThread().interrupt();
                throw new IOException("Шумоподавление было прервано", exception);
            }

            if (!completed) {
                process.destroyForcibly();
                throw new ResponseStatusException(HttpStatus.REQUEST_TIMEOUT, "Превышено время обработки записи");
            }
            if (process.exitValue() != 0 || !Files.isRegularFile(output) || Files.size(output) == 0) {
                throw new ResponseStatusException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "Не удалось обработать голосовую запись. Проверьте формат и наличие аудиодорожки."
                );
            }

            return new ProcessedRecording(output, workDirectory, baseName + ".webm", Files.size(output));
        } catch (IOException | RuntimeException exception) {
            deleteRecursively(workDirectory);
            throw exception;
        }
    }

    private static void deleteRecursively(Path directory) {
        try {
            if (!Files.exists(directory)) return;
            try (var paths = Files.walk(directory)) {
                for (Path path : paths.sorted(java.util.Comparator.reverseOrder()).toList()) {
                    Files.deleteIfExists(path);
                }
            }
        } catch (IOException ignored) {
            // A temporary-file cleanup failure must not invalidate an otherwise saved recording.
        }
    }

    public record ProcessedRecording(
            Path path,
            Path workDirectory,
            String originalFilename,
            long size
    ) implements AutoCloseable {
        @Override
        public void close() {
            deleteRecursively(workDirectory);
        }
    }
}
