package audio.business.card.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "card_experience")
@Getter
@Setter
public class CardExperience {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false, unique = true)
    private AudioCard audioCard;

    @Min(0)
    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears = 0;
}
