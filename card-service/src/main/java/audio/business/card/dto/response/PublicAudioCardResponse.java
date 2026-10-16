package audio.business.card.dto.response;

import audio.business.card.enums.CardType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class PublicAudioCardResponse {
    private UUID id;
    private String fullName;
    private String contactEmail;
    private String contactPhone;
    private String title;
    private String description;
    private String photoUrl;
    private String documentName;
    private String documentUrl;
    private CardType cardType;
    private List<String> skills;
    private Integer experienceYears;
    private Integer voiceVolume;
    private Integer musicVolume;
    private Integer musicStartSeconds;
    private String voiceUrl;
    private String musicUrl;
    private LocalDateTime publishedAt;
    private String publicCode;
}
