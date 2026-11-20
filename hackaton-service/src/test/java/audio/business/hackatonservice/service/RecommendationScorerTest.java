package audio.business.hackatonservice.service;

import audio.business.hackatonservice.entity.TeamRecruitment;
import audio.business.hackatonservice.service.CardClient.CardProfile;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RecommendationScorerTest {
    private final RecommendationScorer scorer = new RecommendationScorer();

    @Test
    void combinesSkillsFromAllUserCards() {
        UUID backendCardId = UUID.randomUUID();
        UUID devOpsCardId = UUID.randomUUID();
        List<CardProfile> cards = List.of(
                new CardProfile(
                        backendCardId,
                        "Java-разработчик",
                        "Backend-разработчик",
                        "Разрабатываю серверные приложения",
                        List.of("Java", "Spring"),
                        true
                ),
                new CardProfile(
                        devOpsCardId,
                        "DevOps",
                        "DevOps-инженер",
                        "Настраиваю инфраструктуру",
                        List.of("Docker", "K8s"),
                        false
                )
        );
        TeamRecruitment recruitment = recruitment(
                "Backend-команда",
                "Нужен Java-разработчик",
                "Java",
                "Spring Boot",
                "Docker",
                "Kafka"
        );

        RecommendationScorer.ScoreResult result = scorer.score(recruitment, cards);

        assertThat(result.matchedSkills()).containsExactly("Java", "Spring Boot", "Docker");
        assertThat(result.missingSkills()).containsExactly("Kafka");
        assertThat(result.matchingCardIds()).containsExactlyInAnyOrder(backendCardId, devOpsCardId);
        assertThat(result.score()).isGreaterThanOrEqualTo(60);
    }

    @Test
    void returnsExplainableResultWhenSkillsAreNotSpecified() {
        TeamRecruitment recruitment = recruitment(
                "Команда для мобильного приложения",
                "Ищем разработчиков",
                new String[0]
        );

        RecommendationScorer.ScoreResult result = scorer.score(recruitment, List.of());

        assertThat(result.score()).isEqualTo(40);
        assertThat(result.reasons()).contains("Организатор не указал обязательные навыки");
    }

    private TeamRecruitment recruitment(String title, String description, String... skills) {
        TeamRecruitment recruitment = new TeamRecruitment();
        recruitment.setTitle(title);
        recruitment.setDescription(description);
        recruitment.setRequiredSkills(new LinkedHashSet<>(List.of(skills)));
        return recruitment;
    }
}
