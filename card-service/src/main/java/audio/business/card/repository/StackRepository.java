package audio.business.card.repository;

import audio.business.card.entity.Stack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StackRepository extends JpaRepository<Stack, UUID> {
}
