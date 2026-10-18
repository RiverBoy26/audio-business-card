package audio.business.card.service.impl;

import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.entity.AudioCard;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.repository.CardExperienceRepository;
import audio.business.card.repository.CardSphereRepository;
import audio.business.card.repository.CardStackRepository;
import audio.business.card.service.CardDocumentStorageService;
import audio.business.card.service.CardImageStorageService;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AudioCardPhotoSelectionTest {
    private final AudioCardRepository cards = mock(AudioCardRepository.class);
    private final CardImageStorageService images = mock(CardImageStorageService.class);
    private final AudioCardServiceImp service = new AudioCardServiceImp(cards,
            mock(CardExperienceRepository.class), mock(CardStackRepository.class),
            mock(CardSphereRepository.class), images, mock(CardDocumentStorageService.class), "http://localhost:8083");

    @Test
    void sharedCardUsesSelectedProfileAvatarEvenIfOldPhotoFileRemains() {
        AudioCard card = card();
        card.setPhotoFilename("old-photo.png");
        card.setPhotoUrl(profileAvatar(card));
        when(cards.findById(card.getId())).thenReturn(Optional.of(card));

        assertThat(service.findSharedById(card.getId()).getPhotoUrl()).isEqualTo(profileAvatar(card));
    }

    @Test
    void selectingProfileAvatarRemovesOldCardPhoto() {
        AudioCard card = card();
        card.setPhotoFilename("old-photo.png");
        card.setPhotoContentType("image/png");
        card.setPhotoUrl("/audio-cards/" + card.getId() + "/photo?v=old-photo.png");
        when(cards.findByIdAndUserId(card.getId(), card.getUserId())).thenReturn(Optional.of(card));
        when(cards.save(card)).thenReturn(card);
        AudioCardRequest request = new AudioCardRequest();
        request.setPhotoUrl(profileAvatar(card));

        service.update(card.getUserId(), card.getId(), request);

        assertThat(card.getPhotoFilename()).isNull();
        assertThat(card.getPhotoContentType()).isNull();
        assertThat(card.getPhotoUrl()).isEqualTo(profileAvatar(card));
        verify(images).delete("old-photo.png");
    }

    private AudioCard card() {
        AudioCard card = new AudioCard();
        card.setId(UUID.randomUUID());
        card.setUserId(UUID.randomUUID());
        card.setTitle("Разработчик");
        return card;
    }

    private String profileAvatar(AudioCard card) {
        return "/api/v1/auth/users/" + card.getUserId() + "/avatar";
    }
}
