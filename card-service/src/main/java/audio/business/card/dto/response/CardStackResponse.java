package audio.business.card.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CardStackResponse {
    private UUID id;
    private UUID stackId;
    private String stackName;
}