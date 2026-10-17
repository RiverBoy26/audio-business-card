package audio.business.hackatonservice.repository;

import audio.business.hackatonservice.entity.TeamRecruitment;
import audio.business.hackatonservice.model.RecruitmentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamRecruitmentRepository extends JpaRepository<TeamRecruitment, UUID> {
    Page<TeamRecruitment> findByStatusAndDeadlineAfter(RecruitmentStatus status, Instant deadline, Pageable pageable);

    List<TeamRecruitment> findByStatusAndDeadlineAfter(RecruitmentStatus status, Instant deadline);

    List<TeamRecruitment> findByCreatorIdOrderByCreatedAtDesc(UUID creatorId);

    Optional<TeamRecruitment> findByIdAndCreatorId(UUID id, UUID creatorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from TeamRecruitment r where r.id = :id")
    Optional<TeamRecruitment> findByIdForUpdate(UUID id);
}
