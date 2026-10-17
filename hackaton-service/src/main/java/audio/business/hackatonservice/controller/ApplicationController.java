package audio.business.hackatonservice.controller;

import audio.business.hackatonservice.dto.*;
import audio.business.hackatonservice.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService service;

    @GetMapping("/mine")
    public List<ApplicationResponse> mine(@RequestHeader("X-Authenticated-User-Id") UUID userId) {
        return service.findMine(userId);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse decide(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationStatusRequest request) {
        return service.decide(userId, id, request);
    }

    @PostMapping("/{id}/withdraw")
    public ApplicationResponse withdraw(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID id) {
        return service.withdraw(userId, id);
    }
}
