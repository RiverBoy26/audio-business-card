package audio.business.card.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "card_settings")
@Getter
@Setter
public class CardSettings {
    @Id
    @Column(name = "card_id")
    private UUID cardId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "card_id")
    private AudioCard audioCard;

    @Min(0)
    @Max(100)
    @Column(name = "voice_volume", nullable = false)
    private Integer voiceVolume = 100;

    @Min(0)
    @Max(100)
    @Column(name = "music_volume", nullable = false)
    private Integer musicVolume = 30;

    @Min(0)
    @Column(name = "music_start_seconds", nullable = false, columnDefinition = "integer default 0")
    private Integer musicStartSeconds = 0;
}
