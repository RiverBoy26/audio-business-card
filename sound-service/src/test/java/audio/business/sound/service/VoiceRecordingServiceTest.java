package audio.business.sound.service;

import audio.business.sound.model.VoiceRecording;
import audio.business.sound.repository.VoiceRecordingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class VoiceRecordingServiceTest {

    @Test
    void storesTheOriginalRecordingWithoutNoiseReduction() throws Exception {
        VoiceRecordingRepository repository = mock(VoiceRecordingRepository.class);
        VoiceRecordingStorageService storage = mock(VoiceRecordingStorageService.class);
        VoiceRecordingService service = new VoiceRecordingService(repository, storage);
        UUID userId = UUID.randomUUID();
        var file = new MockMultipartFile("file", "voice.ogg", "audio/ogg", new byte[]{1, 2, 3, 4});
        when(storage.store(file)).thenReturn("stored.ogg");
        when(repository.save(any(VoiceRecording.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.upload(file, 12, userId);

        assertEquals("voice.ogg", response.originalFilename());
        assertEquals("audio/ogg", response.contentType());
        assertEquals(4, response.size());
        assertEquals(12, response.durationSeconds());
        verify(storage).store(file);
    }
}
