package audio.business.hackatonservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Component
public class CardClient {
    private final RestClient client;

    public CardClient(@Value("${app.card-service-url}") String baseUrl) {
        this.client = RestClient.create(baseUrl);
    }

    public void verifyOwnedCard(UUID userId, UUID cardId) {
        try {
            CardView card = client.get()
                    .uri("/audio-cards/{id}", cardId)
                    .header("X-Authenticated-User-Id", userId.toString())
                    .retrieve()
                    .body(CardView.class);
            if (card == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Визитка не найдена");
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 404) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Визитка не найдена или не принадлежит пользователю");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Не удалось проверить визитку");
        }
    }

    public SharedCard findSharedCard(UUID cardId) {
        try {
            SharedCard card = client.get().uri("/internal/audio-cards/{id}", cardId)
                    .retrieve().body(SharedCard.class);
            if (card == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Визитка не найдена");
            return card;
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Визитка не найдена");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Не удалось получить визитку");
        }
    }

    public CardMedia getSharedMedia(UUID cardId, String media) {
        try {
            ResponseEntity<byte[]> response = client.get()
                    .uri("/internal/audio-cards/{id}/{media}", cardId, media)
                    .retrieve().toEntity(byte[].class);
            return new CardMedia(response.getBody() == null ? new byte[0] : response.getBody(),
                    response.getHeaders().getContentType(), response.getHeaders().getFirst("Content-Disposition"));
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Файл визитки не найден");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Не удалось получить файл визитки");
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

    public record SharedCard(UUID id, String fullName, String contactEmail, String contactPhone,
            String title, String description, String photoUrl, String documentName, String documentUrl,
            List<String> skills, Integer experienceYears, Integer voiceVolume, Integer musicVolume,
            Integer musicStartSeconds, String voiceUrl, String musicUrl, LocalDateTime publishedAt,
            String publicCode) {
    }

    public record CardMedia(byte[] content, org.springframework.http.MediaType contentType,
            String contentDisposition) {
    }
}
