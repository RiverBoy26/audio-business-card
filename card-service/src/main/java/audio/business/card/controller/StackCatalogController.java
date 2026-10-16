package audio.business.card.controller;

import audio.business.card.dto.response.StackSuggestionResponse;
import audio.business.card.service.impl.StackCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/stacks")
public class StackCatalogController {
    private final StackCatalogService stackCatalogService;

    public StackCatalogController(StackCatalogService stackCatalogService) {
        this.stackCatalogService = stackCatalogService;
    }

    @GetMapping
    public List<StackSuggestionResponse> findAll() {
        return stackCatalogService.findAll();
    }
}
