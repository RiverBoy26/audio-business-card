package audio.business.card.repository;

import audio.business.card.entity.Sphere;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SphereRepository extends JpaRepository<Sphere, UUID> {
}
