package audio.business.card.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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

    @Column(name = "voice_volume", nullable = false)
    private Integer voiceVolume = 100;

    @Column(name = "music_volume", nullable = false)
    private Integer musicVolume = 30;
}
