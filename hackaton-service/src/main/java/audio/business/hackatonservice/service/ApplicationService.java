package audio.business.hackatonservice.service;

import audio.business.hackatonservice.dto.*;
import audio.business.hackatonservice.entity.*;
import audio.business.hackatonservice.model.*;
import audio.business.hackatonservice.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ApplicationService {
    private final TeamRecruitmentRepository recruitments;
    private final TeamApplicationRepository applications;
    private final CardClient cardClient;

    public ApplicationService(
            TeamRecruitmentRepository recruitments,
            TeamApplicationRepository applications,
            CardClient cardClient) {
        this.recruitments = recruitments;
        this.applications = applications;
        this.cardClient = cardClient;
    }

    @Transactional
    public ApplicationResponse apply(UUID userId, UUID recruitmentId, ApplicationRequest request) {
        TeamRecruitment recruitment = recruitments.findById(recruitmentId).orElseThrow(this::recruitmentNotFound);
        ensureOpen(recruitment);
        if (recruitment.getCreatorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Нельзя откликнуться на собственное объявление");
        }
        cardClient.verifyPublishedOwnedCard(userId, request.audioCardId());
        TeamApplication value = applications.findByRecruitmentIdAndApplicantId(recruitmentId, userId).orElse(null);
        if (value != null && value.getStatus() != ApplicationStatus.WITHDRAWN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Вы уже откликнулись на это объявление");
        }
        if (value == null) {
            value = new TeamApplication();
            value.setRecruitment(recruitment);
            value.setApplicantId(userId);
        }
        value.setAudioCardId(request.audioCardId());
        value.setMessage(trimToNull(request.message()));
        value.setStatus(ApplicationStatus.PENDING);
        value.setViewedAt(null);
        value.setDecidedAt(null);
        return toResponse(applications.save(value));
    }

    @Transactional
    public List<ApplicationResponse> findForRecruitment(UUID ownerId, UUID recruitmentId) {
        TeamRecruitment recruitment = recruitments.findByIdAndCreatorId(recruitmentId, ownerId)
                .orElseThrow(this::recruitmentNotFound);
        List<TeamApplication> values = applications.findByRecruitmentIdOrderByCreatedAtDesc(recruitment.getId());
        Instant now = Instant.now();
        values.stream().filter(v -> v.getViewedAt() == null).forEach(v -> v.setViewedAt(now));
        return applications.saveAll(values).stream().map(this::toResponse).toList();
    }

    public List<ApplicationResponse> findMine(UUID userId) {
        return applications.findByApplicantIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ApplicationResponse decide(UUID ownerId, UUID applicationId, ApplicationStatusRequest request) {
        if (request.status() != ApplicationStatus.ACCEPTED && request.status() != ApplicationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Допустимы только статусы ACCEPTED и REJECTED");
        }
        TeamApplication value = applications.findById(applicationId).orElseThrow(this::applicationNotFound);
        TeamRecruitment recruitment = recruitments.findByIdForUpdate(value.getRecruitment().getId()).orElseThrow(this::recruitmentNotFound);
        if (!recruitment.getCreatorId().equals(ownerId)) {
            throw applicationNotFound();
        }
        if (value.getStatus() != ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Решение по этому отклику уже принято");
        }
        if (request.status() == ApplicationStatus.ACCEPTED) {
            long accepted = applications.countByRecruitmentIdAndStatus(recruitment.getId(), ApplicationStatus.ACCEPTED);
            if (accepted >= recruitment.getParticipantsNeeded()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Все места в команде уже заняты");
            }
        }
        value.setStatus(request.status());
        value.setDecidedAt(Instant.now());
        return toResponse(applications.save(value));
    }

    @Transactional
    public ApplicationResponse withdraw(UUID userId, UUID applicationId) {
        TeamApplication value = applications.findById(applicationId).orElseThrow(this::applicationNotFound);
        if (!value.getApplicantId().equals(userId)) {
            throw applicationNotFound();
        }
        if (value.getStatus() == ApplicationStatus.REJECTED || value.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Этот отклик нельзя отозвать");
        }
        value.setStatus(ApplicationStatus.WITHDRAWN);
        value.setDecidedAt(Instant.now());
        return toResponse(applications.save(value));
    }

    private void ensureOpen(TeamRecruitment value) {
        if (value.getStatus() != RecruitmentStatus.OPEN || !value.getDeadline().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Набор по этому объявлению закрыт");
        }
    }
    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException recruitmentNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Объявление не найдено");
    }

    private ResponseStatusException applicationNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Отклик не найден");
    }

    private ApplicationResponse toResponse(TeamApplication value) {
        return new ApplicationResponse(value.getId(), value.getRecruitment().getId(), value.getApplicantId(),
                value.getAudioCardId(), value.getMessage(), value.getStatus(), value.getViewedAt(),
                value.getDecidedAt(), value.getCreatedAt(), value.getUpdatedAt());
    }
}
