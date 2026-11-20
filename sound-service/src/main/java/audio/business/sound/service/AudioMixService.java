package audio.business.sound.service;

import audio.business.sound.model.MusicFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class AudioMixService {

    private final MusicService musicService;
    private final String ffmpegPath;
    private final Path outputDirectory;

    public AudioMixService(
            MusicService musicService,
            @Value("${app.ffmpeg.path:ffmpeg}") String ffmpegPath,
            @Value("${app.audio.output-dir:uploads/mixed}") String outputDirectory
    ) {
        this.musicService = musicService;
        this.ffmpegPath = ffmpegPath;
        this.outputDirectory = Path.of(outputDirectory)
                .toAbsolutePath()
                .normalize();
    }

    public Path mix(
            MultipartFile voiceFile,
            UUID musicId,
            UUID userId,
            int voiceVolume,
            int musicVolume
    ) throws IOException {

        if (voiceFile == null || voiceFile.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Необходимо загрузить запись голоса"
            );
        }

        if (musicId == null || userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Не указан пользователь или музыкальный файл"
            );
        }

        if (voiceVolume < 0 || voiceVolume > 100
                || musicVolume < 0 || musicVolume > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Громкость должна находиться в диапазоне от 0 до 100"
            );
        }

        // Системные треки доступны всем, пользовательские — только владельцу.
        MusicFile music = musicService.getAccessibleById(musicId, userId);

        Path musicPath = Path.of(music.getStoragePath())
                .toAbsolutePath()
                .normalize();

        if (!Files.isRegularFile(musicPath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Музыкальный файл отсутствует в хранилище"
            );
        }

        Files.createDirectories(outputDirectory);

        Path voicePath = Files.createTempFile("voice-", ".audio");
        Path outputPath = outputDirectory.resolve(
                UUID.randomUUID() + ".mp3"
        );

        try {
            voiceFile.transferTo(voicePath);

            String filter = String.format(
                    "[0:a]volume=%.2f[voice];" +
                            "[1:a]volume=%.2f[music];" +
                            "[voice][music]amix=inputs=2:" +
                            "duration=first:dropout_transition=2[out]",
                    voiceVolume / 100.0,
                    musicVolume / 100.0
            );

            Process process = new ProcessBuilder(
                    ffmpegPath,
                    "-nostdin",
                    "-hide_banner",
                    "-loglevel", "error",
                    "-y",
                    "-i", voicePath.toString(),
                    "-i", musicPath.toString(),
                    "-filter_complex", filter,
                    "-map", "[out]",
                    "-codec:a", "libmp3lame",
                    "-q:a", "2",
                    "-f", "mp3",
                    outputPath.toString()
            )
                    .redirectErrorStream(true)
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .start();

            boolean completed;

            try {
                completed = process.waitFor(2, TimeUnit.MINUTES);
            } catch (InterruptedException exception) {
                process.destroyForcibly();
                Thread.currentThread().interrupt();

                throw new IOException(
                        "Смешивание аудио было прервано",
                        exception
                );
            }

            if (!completed) {
                process.destroyForcibly();

                throw new ResponseStatusException(
                        HttpStatus.REQUEST_TIMEOUT,
                        "Превышено время обработки аудио"
                );
            }

            if (process.exitValue() != 0
                    || !Files.isRegularFile(outputPath)
                    || Files.size(outputPath) == 0) {

                throw new ResponseStatusException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "Не удалось обработать аудиофайлы. " +
                                "Проверьте формат записи и наличие аудиодорожки."
                );
            }

            return outputPath;

        } catch (IOException | RuntimeException exception) {
            Files.deleteIfExists(outputPath);
            throw exception;

        } finally {
            Files.deleteIfExists(voicePath);
        }
    }
}
