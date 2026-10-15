package audio.business.sound.voice;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

/** Explicit developer CLI; does not start Spring or require PostgreSQL. */
public final class VoiceProfileCli {
    public static void main(String[] args) {
        Path recording = null;
        try {
            Map<String, String> options = new LinkedHashMap<>();
            for (int i = 0; i < args.length; i += 2) {
                if (i + 1 >= args.length || !Arrays.asList("--text", "--audio", "--model", "--ffmpeg", "--record").contains(args[i]) || options.put(args[i], args[i + 1]) != null)
                    throw new IllegalArgumentException("Invalid or duplicate CLI option");
            }
            if (options.containsKey("--record")) {
                if (options.containsKey("--text") || options.containsKey("--audio"))
                    throw new IllegalArgumentException("--record cannot be combined with --text or --audio");
                if (!options.containsKey("--model")) throw new IllegalArgumentException("--model is required for recording");
                recording = java.nio.file.Files.createTempFile("voice-recording-", ".wav");
                System.err.println("Recording (maximum " + options.get("--record") + " seconds). Press Enter when you finish speaking.");
                System.err.println("Расскажите естественно: кто вы по специальности (только одна), с чем работаете,");
                System.err.println("какой у вас опыт и кем хотите работать. Например: Я бэкенд-разработчик.");
                System.err.println("Работаю с Java и Spring Boot. Опыт работы два года. Хочу работать Java-разработчиком.");
                new MicrophoneRecorder().record(recording, Integer.parseInt(options.get("--record")));
                options.put("--audio", recording.toString());
            }
            if (options.containsKey("--text") == options.containsKey("--audio"))
                throw new IllegalArgumentException("Specify either --text transcript or --audio file --model ggml-model.bin");
            VoiceProfile result;
            if (options.containsKey("--text")) result = new ProfileValidator().validate(options.get("--text"));
            else {
                if (!options.containsKey("--model")) throw new IllegalArgumentException("--model is required for audio");
                long started = System.nanoTime();
                try (var transcriber = new SherpaOnnxTranscriber(Path.of(options.get("--model")),
                        options.getOrDefault("--ffmpeg", "ffmpeg"), 120)) {
                    System.err.printf("GigaAM loaded in %.2f s; recognizing...%n", (System.nanoTime() - started) / 1_000_000_000.0);
                    result = new VoiceProfileService(transcriber, new ProfileValidator()).extract(Path.of(options.get("--audio")));
                }
            }
            System.out.println(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(result));
        } catch (Exception | LinkageError e) {
            System.err.println("Voice profile failed: " + e.getMessage());
            if (recording != null) try { java.nio.file.Files.deleteIfExists(recording); } catch (Exception ignored) { }
            System.exit(1);
        } finally {
            if (recording != null) try { java.nio.file.Files.deleteIfExists(recording); } catch (Exception ignored) { }
        }
    }
}
