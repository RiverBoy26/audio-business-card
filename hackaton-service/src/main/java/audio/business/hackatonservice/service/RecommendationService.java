package audio.business.hackatonservice.service;

import audio.business.hackatonservice.dto.RecruitmentRecommendationResponse;
import audio.business.hackatonservice.entity.TeamRecruitment;
import audio.business.hackatonservice.model.ApplicationStatus;
import audio.business.hackatonservice.model.RecruitmentStatus;
import audio.business.hackatonservice.repository.TeamApplicationRepository;
import audio.business.hackatonservice.repository.TeamRecruitmentRepository;
import audio.business.hackatonservice.service.CardClient.CardProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RecommendationService {
    private final TeamRecruitmentRepository recruitments;
    private final TeamApplicationRepository applications;
    private final CardClient cardClient;
    private final RecommendationScorer scorer;
    private final RecruitmentService recruitmentService;

    public RecommendationService(
            TeamRecruitmentRepository recruitments,
            TeamApplicationRepository applications,
            CardClient cardClient,
            RecommendationScorer scorer,
            RecruitmentService recruitmentService) {
        this.recruitments = recruitments;
        this.applications = applications;
        this.cardClient = cardClient;
        this.scorer = scorer;
        this.recruitmentService = recruitmentService;
    }

    public Page<RecruitmentRecommendationResponse> findForUser(UUID userId, int page, int size) {
        List<CardProfile> cards = cardClient.findAllByUser(userId);
        Set<UUID> appliedRecruitmentIds = applications.findByApplicantIdOrderByCreatedAtDesc(userId).stream()
                .filter(application -> application.getStatus() != ApplicationStatus.WITHDRAWN)
                .map(application -> application.getRecruitment().getId())
                .collect(Collectors.toSet());

        List<RankedRecruitment> ranked = recruitments
                .findByStatusAndDeadlineAfter(RecruitmentStatus.OPEN, Instant.now())
                .stream()
                .filter(recruitment -> !recruitment.getCreatorId().equals(userId))
                .filter(recruitment -> !appliedRecruitmentIds.contains(recruitment.getId()))
                .map(recruitment -> new RankedRecruitment(recruitment, scorer.score(recruitment, cards)))
                .sorted(Comparator
                        .comparingInt((RankedRecruitment value) -> value.score().score())
                        .reversed()
                        .thenComparing(value -> value.recruitment().getCreatedAt(), Comparator.reverseOrder()))
                .toList();

        int fromIndex = Math.min(page * size, ranked.size());
        int toIndex = Math.min(fromIndex + size, ranked.size());
        List<RecruitmentRecommendationResponse> content = ranked.subList(fromIndex, toIndex).stream()
                .map(this::toResponse)
                .toList();

        return new PageImpl<>(content, PageRequest.of(page, size), ranked.size());
    }

    private RecruitmentRecommendationResponse toResponse(RankedRecruitment value) {
        RecommendationScorer.ScoreResult score = value.score();
        return new RecruitmentRecommendationResponse(
                recruitmentService.toResponse(value.recruitment()),
                score.score(),
                score.matchedSkills(),
                score.missingSkills(),
                score.matchingCardIds(),
                score.reasons()
        );
    }

    private record RankedRecruitment(
            TeamRecruitment recruitment,
            RecommendationScorer.ScoreResult score) {
    }
}
