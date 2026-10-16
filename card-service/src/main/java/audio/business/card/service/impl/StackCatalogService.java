package audio.business.card.service.impl;

import audio.business.card.dto.response.StackSuggestionResponse;
import audio.business.card.repository.StackRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class StackCatalogService {
    private static final Map<String, List<String>> RUSSIAN_ALIASES = Map.ofEntries(
            Map.entry("javascript", List.of("джаваскрипт", "джава скрипт")),
            Map.entry("typescript", List.of("тайпскрипт", "тайп скрипт")),
            Map.entry("python", List.of("питон", "пайтон")),
            Map.entry("java", List.of("джава")),
            Map.entry("c#", List.of("си шарп")),
            Map.entry("c++", List.of("си плюс плюс")),
            Map.entry("go", List.of("голанг")),
            Map.entry("php", List.of("пи эйч пи")),
            Map.entry("sql", List.of("эс кью эл", "сиквел")),
            Map.entry("react", List.of("реакт")),
            Map.entry("vue.js", List.of("вью")),
            Map.entry("angular", List.of("ангуляр")),
            Map.entry("next.js", List.of("некст джей эс")),
            Map.entry("tailwind css", List.of("тейлвинд си эс эс")),
            Map.entry("fastapi", List.of("фаст апи")),
            Map.entry("django", List.of("джанго")),
            Map.entry("spring boot", List.of("спринг бут")),
            Map.entry("node.js", List.of("нод джей эс")),
            Map.entry("react native", List.of("реакт нейтив")),
            Map.entry("postman", List.of("постман")),
            Map.entry("playwright", List.of("плейрайт")),
            Map.entry("postgresql", List.of("постгрес")),
            Map.entry("mysql", List.of("май эс кью эл")),
            Map.entry("sqlite", List.of("эс кью эл лайт")),
            Map.entry("mongodb", List.of("монго ди би")),
            Map.entry("redis", List.of("редис")),
            Map.entry("clickhouse", List.of("кликхаус")),
            Map.entry("pytorch", List.of("пайторч")),
            Map.entry("tensorflow", List.of("тензорфлоу")),
            Map.entry("linux", List.of("линукс")),
            Map.entry("docker", List.of("докер")),
            Map.entry("kubernetes", List.of("кубернетес", "кубер")),
            Map.entry("nginx", List.of("энжинкс")),
            Map.entry("jenkins", List.of("дженкинс")),
            Map.entry("ansible", List.of("ансибл")),
            Map.entry("terraform", List.of("терраформ")),
            Map.entry("figma", List.of("фигма")),
            Map.entry("git", List.of("гит")),
            Map.entry("github", List.of("гитхаб", "гит хаб")),
            Map.entry("gitlab", List.of("гитлаб", "гит лаб")),
            Map.entry("apache kafka", List.of("кафка")),
            Map.entry("rabbitmq", List.of("рэббит эм кью")),
            Map.entry("rest api", List.of("рест апи")),
            Map.entry("http", List.of("эйч ти ти пи")),
            Map.entry("websocket", List.of("вебсокет"))
    );

    private final StackRepository stackRepository;

    public StackCatalogService(StackRepository stackRepository) {
        this.stackRepository = stackRepository;
    }

    public List<StackSuggestionResponse> findAll() {
        return stackRepository.findAll().stream()
                .sorted(Comparator.comparing(stack -> stack.getName().toLowerCase(Locale.ROOT)))
                .map(stack -> new StackSuggestionResponse(
                        stack.getId(),
                        stack.getName(),
                        RUSSIAN_ALIASES.getOrDefault(stack.getName().toLowerCase(Locale.ROOT), List.of())
                ))
                .toList();
    }
}
