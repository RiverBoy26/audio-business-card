package audio.business.hackatonservice.service;

import audio.business.hackatonservice.dto.*;
import audio.business.hackatonservice.entity.TeamRecruitment;
import audio.business.hackatonservice.model.*;
import audio.business.hackatonservice.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class RecruitmentService {
    private final TeamRecruitmentRepository recruitments;
    private final TeamApplicationRepository applications;

    public RecruitmentService(TeamRecruitmentRepository recruitments, TeamApplicationRepository applications) {
        this.recruitments = recruitments;
        this.applications = applications;
    }

    public Page<RecruitmentResponse> findOpen(Pageable pageable) {
        return recruitments.findByStatusAndDeadlineAfter(RecruitmentStatus.OPEN, Instant.now(), pageable).map(this::toResponse);
    }
    public RecruitmentResponse findOpenById(UUID id) {
        TeamRecruitment value = find(id);
        if (value.getStatus() != RecruitmentStatus.OPEN || !value.getDeadline().isAfter(Instant.now())) {
            throw notFound();
        }
        return toResponse(value);
    }
    public List<RecruitmentResponse> findMine(UUID userId) {
        return recruitments.findByCreatorIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }
    @Transactional
    public RecruitmentResponse create(UUID userId, RecruitmentRequest request) {
        TeamRecruitment value = new TeamRecruitment();
        value.setCreatorId(userId);
        apply(value, request);
        value.setStatus(RecruitmentStatus.DRAFT);
        return toResponse(recruitments.save(value));
    }
    @Transactional
    public RecruitmentResponse update(UUID userId, UUID id, RecruitmentRequest request) {
        TeamRecruitment value = findOwned(userId, id);
        if (value.getStatus() == RecruitmentStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Архивное объявление нельзя изменить");
        }
        apply(value, request);
        return toResponse(recruitments.save(value));
    }
    @Transactional
    public RecruitmentResponse publish(UUID userId, UUID id) {
        TeamRecruitment value = findOwned(userId, id);
        if (!value.getDeadline().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Срок набора должен быть в будущем");
        }
        value.setStatus(RecruitmentStatus.OPEN);
        return toResponse(recruitments.save(value));
    }
    @Transactional
    public RecruitmentResponse close(UUID userId, UUID id) {
        TeamRecruitment value = findOwned(userId, id);
        value.setStatus(RecruitmentStatus.CLOSED);
        return toResponse(recruitments.save(value));
    }
    @Transactional
    public RecruitmentResponse archive(UUID userId, UUID id) {
        TeamRecruitment value = findOwned(userId, id);
        value.setStatus(RecruitmentStatus.ARCHIVED);
        return toResponse(recruitments.save(value));
    }
    private void apply(TeamRecruitment value, RecruitmentRequest request) {
        if ((request.format() == EventFormat.OFFLINE || request.format() == EventFormat.HYBRID)
                && (request.location() == null || request.location().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Для очного или гибридного формата укажите место");
        }
        value.setTitle(request.title().trim());
        value.setEventName(request.eventName().trim());
        value.setDescription(request.description().trim());
        value.setParticipantsNeeded(request.participantsNeeded());
        value.setRequiredSkills(normalizeSkills(request.requiredSkills()));
        value.setFormat(request.format());
        value.setLocation(blankToNull(request.location()));
        value.setEventUrl(blankToNull(request.eventUrl()));
        value.setDeadline(request.deadline());
    }
    private Set<String> normalizeSkills(Set<String> source) {
        if (source == null) {
            return new LinkedHashSet<>();
        }
        Map<String, String> unique = new LinkedHashMap<>();
        source.forEach(raw -> {
            String skill = raw.trim().replaceAll("\\s+", " ");
            unique.putIfAbsent(skill.toLowerCase(Locale.ROOT), skill);
        });
        return new LinkedHashSet<>(unique.values());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private TeamRecruitment find(UUID id) {
        return recruitments.findById(id).orElseThrow(this::notFound);
    }

    private TeamRecruitment findOwned(UUID userId, UUID id) {
        return recruitments.findByIdAndCreatorId(id, userId).orElseThrow(this::notFound);
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Объявление не найдено");
    }

    RecruitmentResponse toResponse(TeamRecruitment value) {
        long accepted = applications.countByRecruitmentIdAndStatus(value.getId(), ApplicationStatus.ACCEPTED);
        return new RecruitmentResponse(value.getId(), value.getCreatorId(), value.getTitle(), value.getEventName(),
                value.getDescription(), value.getParticipantsNeeded(), accepted, value.getRequiredSkills(), value.getFormat(),
                value.getLocation(), value.getEventUrl(), value.getDeadline(), value.getStatus(),
                value.getCreatedAt(), value.getUpdatedAt());
    }
}
