package audio.business.hackatonservice.repository;

import audio.business.hackatonservice.entity.TeamApplication;
import audio.business.hackatonservice.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamApplicationRepository extends JpaRepository<TeamApplication, UUID> {
    List<TeamApplication> findByRecruitmentIdOrderByCreatedAtDesc(UUID recruitmentId);

    List<TeamApplication> findByApplicantIdOrderByCreatedAtDesc(UUID applicantId);

    Optional<TeamApplication> findByRecruitmentIdAndApplicantId(UUID recruitmentId, UUID applicantId);

    long countByRecruitmentIdAndStatus(UUID recruitmentId, ApplicationStatus status);
}
