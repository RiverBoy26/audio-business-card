package audio.business.sound.service;

import audio.business.sound.model.MusicFile;
import audio.business.sound.repository.MusicRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class MusicServiceTest {

    @Test
    void reusesAnExistingUploadWithTheSameNameAndSize() throws Exception {
        MusicRepository repository = mock(MusicRepository.class);
        MusicStorageService storage = mock(MusicStorageService.class);
        MusicService service = new MusicService(repository, storage);
        UUID userId = UUID.randomUUID();
        UUID musicId = UUID.randomUUID();
        var file = new MockMultipartFile("file", "track.mp3", "audio/mpeg", new byte[]{1, 2, 3});
        MusicFile existing = new MusicFile();
        existing.setId(musicId);
        existing.setUserId(userId);
        existing.setOriginalFilename("track.mp3");
        existing.setStoredFilename("stored.mp3");
        existing.setStoragePath("/music/stored.mp3");
        existing.setContentType("audio/mpeg");
        existing.setSize(3);
        existing.setUploadedAt(LocalDateTime.now());
        when(repository.findFirstByUserIdAndOriginalFilenameIgnoreCaseAndSizeOrderByUploadedAtDesc(
                userId, "track.mp3", 3)).thenReturn(Optional.of(existing));

        var response = service.upload(file, userId);

        assertEquals(musicId, response.id());
        verifyNoInteractions(storage);
        verify(repository, never()).save(any());
    }
}
