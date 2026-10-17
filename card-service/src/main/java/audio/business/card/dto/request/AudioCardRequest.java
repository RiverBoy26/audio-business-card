package audio.business.card.dto.request;

import audio.business.card.enums.CardType;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class AudioCardRequest {
    private String title;
    private String fullName;
    private String contactEmail;
    private String contactPhone;
    private String description;
    private String photoUrl;
    private CardType cardType;
    private List<String> skills;
    private UUID musicId;
    private UUID voiceRecordingId;
    @Setter(AccessLevel.NONE)
    private boolean musicIdProvided;
    @Setter(AccessLevel.NONE)
    private boolean voiceRecordingIdProvided;

    public void setMusicId(UUID musicId) {
        this.musicId = musicId;
        this.musicIdProvided = true;
    }

    public void setVoiceRecordingId(UUID voiceRecordingId) {
        this.voiceRecordingId = voiceRecordingId;
        this.voiceRecordingIdProvided = true;
    }
    private String desiredPosition;

}
