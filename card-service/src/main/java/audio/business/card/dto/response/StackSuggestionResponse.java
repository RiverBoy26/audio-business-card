package audio.business.card.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class StackSuggestionResponse {
    private UUID id;
    private String name;
    private List<String> aliases;
}
