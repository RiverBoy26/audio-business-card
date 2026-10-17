package audio.business.hackatonservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class CardClient {
    private final RestClient client;

    public CardClient(@Value("${app.card-service-url}") String baseUrl) {
        this.client = RestClient.create(baseUrl);
    }

    public void verifyPublishedOwnedCard(UUID userId, UUID cardId) {
        try {
            CardView card = client.get()
                    .uri("/audio-cards/{id}", cardId)
                    .header("X-Authenticated-User-Id", userId.toString())
                    .retrieve()
                    .body(CardView.class);
            if (card == null || !card.published()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Для отклика выберите опубликованную визитку");
            }
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 404) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Визитка не найдена или не принадлежит пользователю");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Не удалось проверить визитку");
        }
    }

    public List<CardProfile> findAllByUser(UUID userId) {
        try {
            CardProfile[] cards = client.get()
                    .uri("/audio-cards")
                    .header("X-Authenticated-User-Id", userId.toString())
                    .retrieve()
                    .body(CardProfile[].class);
            return cards == null ? List.of() : Arrays.asList(cards);
        } catch (RestClientResponseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Не удалось получить визитки пользователя");
        }
    }

    public record CardProfile(
            UUID id,
            String title,
            String desiredPosition,
            String description,
            List<String> skills,
            boolean published) {
    }

    private record CardView(UUID id, boolean published) {
    }
}
