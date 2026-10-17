package audio.business.card.dto.response;

import audio.business.card.enums.CardType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class AudioCardResponse {
    private UUID id;
    private String title;
    private String fullName;
    private String contactEmail;
    private String contactPhone;
    private String description;
    private String photoUrl;
    private String documentName;
    private String documentUrl;
    private CardType cardType;
    private List<String> skills;
    private UUID musicId;
    private UUID voiceRecordingId;
    private boolean published;
    private java.time.LocalDateTime publishedAt;
    private String publicCode;
    private String desiredPosition;
}

