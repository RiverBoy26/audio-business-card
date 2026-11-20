package audio.business.hackatonservice.service;

import audio.business.hackatonservice.entity.TeamRecruitment;
import audio.business.hackatonservice.service.CardClient.CardProfile;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class RecommendationScorer {
    private static final Map<String, String> SKILL_ALIASES = Map.ofEntries(
            Map.entry("js", "javascript"),
            Map.entry("ts", "typescript"),
            Map.entry("postgres", "postgresql"),
            Map.entry("spring", "spring boot"),
            Map.entry("k8s", "kubernetes"),
            Map.entry("react.js", "react"),
            Map.entry("node.js", "nodejs")
    );

    public ScoreResult score(TeamRecruitment recruitment, List<CardProfile> cards) {
        Map<String, String> userSkills = cards.stream()
                .filter(Objects::nonNull)
                .flatMap(card -> safeList(card.skills()).stream())
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        this::normalizeSkill,
                        String::trim,
                        (first, second) -> first,
                        LinkedHashMap::new
                ));

        Map<String, String> requiredSkills = recruitment.getRequiredSkills().stream()
                .collect(Collectors.toMap(
                        this::normalizeSkill,
                        String::trim,
                        (first, second) -> first,
                        LinkedHashMap::new
                ));

        List<String> matchedSkills = requiredSkills.entrySet().stream()
                .filter(entry -> userSkills.containsKey(entry.getKey()))
                .map(Map.Entry::getValue)
                .toList();
        List<String> missingSkills = requiredSkills.entrySet().stream()
                .filter(entry -> !userSkills.containsKey(entry.getKey()))
                .map(Map.Entry::getValue)
                .toList();

        Set<String> profileTokens = cards.stream()
                .flatMap(card -> tokens(String.join(" ",
                        safe(card.title()),
                        safe(card.desiredPosition()),
                        safe(card.description()))).stream())
                .collect(Collectors.toSet());
        Set<String> recruitmentTokens = tokens(recruitment.getTitle() + " " + recruitment.getDescription());
        long commonTokens = recruitmentTokens.stream().filter(profileTokens::contains).count();

        double skillScore = requiredSkills.isEmpty()
                ? 0.5
                : (double) matchedSkills.size() / requiredSkills.size();
        double textScore = recruitmentTokens.isEmpty()
                ? 0
                : Math.min(1, (double) commonTokens / Math.min(8, recruitmentTokens.size()));
        int totalScore = (int) Math.round((skillScore * 80) + (textScore * 20));

        List<UUID> matchingCardIds = cards.stream()
                .filter(card -> matches(card, requiredSkills.keySet(), recruitmentTokens))
                .map(CardProfile::id)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<String> reasons = buildReasons(matchedSkills, missingSkills, commonTokens, requiredSkills.isEmpty());
        return new ScoreResult(totalScore, matchedSkills, missingSkills, matchingCardIds, reasons);
    }

    private boolean matches(CardProfile card, Set<String> requiredSkills, Set<String> recruitmentTokens) {
        boolean skillMatch = safeList(card.skills()).stream()
                .filter(Objects::nonNull)
                .map(this::normalizeSkill)
                .anyMatch(requiredSkills::contains);
        Set<String> cardTokens = tokens(String.join(" ",
                safe(card.title()),
                safe(card.desiredPosition()),
                safe(card.description())));
        return skillMatch || cardTokens.stream().anyMatch(recruitmentTokens::contains);
    }

    private List<String> buildReasons(
            List<String> matchedSkills,
            List<String> missingSkills,
            long commonTokens,
            boolean noRequiredSkills) {
        List<String> reasons = new ArrayList<>();
        if (!matchedSkills.isEmpty()) {
            reasons.add("Совпавшие навыки: " + String.join(", ", matchedSkills));
        }
        if (commonTokens > 0) {
            reasons.add("Направление мероприятия совпадает с описанием и позициями в визитках");
        }
        if (noRequiredSkills) {
            reasons.add("Организатор не указал обязательные навыки");
        } else if (missingSkills.isEmpty()) {
            reasons.add("Все требуемые навыки присутствуют в ваших визитках");
        }
        if (reasons.isEmpty()) {
            reasons.add("Объявление доступно для отклика, но явных совпадений пока не найдено");
        }
        return reasons;
    }

    private String normalizeSkill(String value) {
        String normalized = value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
        return SKILL_ALIASES.getOrDefault(normalized, normalized);
    }

    private Set<String> tokens(String value) {
        return Arrays.stream(value.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}+#.]+"))
                .map(String::trim)
                .filter(token -> token.length() >= 2)
                .collect(Collectors.toSet());
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private List<String> safeList(List<String> value) {
        return value == null ? List.of() : value;
    }

    public record ScoreResult(
            int score,
            List<String> matchedSkills,
            List<String> missingSkills,
            List<UUID> matchingCardIds,
            List<String> reasons) {
    }
}
