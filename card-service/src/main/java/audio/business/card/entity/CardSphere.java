package audio.business.card.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "card_sphere",
        uniqueConstraints = @UniqueConstraint(columnNames = {"card_id", "sphere_id"}))
@Getter
@Setter
public class CardSphere {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private AudioCard audioCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sphere_id", nullable = false)
    private Sphere sphere;
}