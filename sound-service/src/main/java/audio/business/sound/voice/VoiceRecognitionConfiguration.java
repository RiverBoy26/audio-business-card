package audio.business.sound.voice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Path;

/** Loads the local ASR model once when voice recognition is enabled. */
@Configuration(proxyBeanMethods = false)
public class VoiceRecognitionConfiguration {
    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(name = "voice.model-directory")
    SherpaOnnxTranscriber speechTranscriber(
            @Value("${voice.model-directory}") String modelDirectory,
            @Value("${voice.ffmpeg:ffmpeg}") String ffmpeg,
            @Value("${voice.max-seconds:120}") int maxSeconds) throws IOException {
        return new SherpaOnnxTranscriber(Path.of(modelDirectory), ffmpeg, maxSeconds);
    }

    @Bean
    @ConditionalOnProperty(name = "voice.model-directory")
    VoiceProfileService voiceProfileService(SherpaOnnxTranscriber transcriber) {
        return new VoiceProfileService(transcriber, new ProfileValidator());
    }
}
