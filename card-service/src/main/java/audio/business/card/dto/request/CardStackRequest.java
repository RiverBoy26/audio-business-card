package audio.business.card.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CardStackRequest {
    @NotEmpty
    private List<@NotNull UUID> stackIds;
}