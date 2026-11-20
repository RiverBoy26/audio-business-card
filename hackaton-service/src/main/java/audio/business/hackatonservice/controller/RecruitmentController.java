package audio.business.hackatonservice.controller;

import audio.business.hackatonservice.dto.*;
import audio.business.hackatonservice.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitments")
@RequiredArgsConstructor
public class RecruitmentController {
    private final RecruitmentService service;
    private final ApplicationService applicationService;

    @GetMapping
    public Page<RecruitmentResponse> all(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return service.findOpen(pageable);
    }

    @GetMapping("/{id}")
    public RecruitmentResponse one(@PathVariable UUID id) {
        return service.findOpenById(id);
    }

    @GetMapping("/mine")
    public List<RecruitmentResponse> mine(@RequestHeader("X-Authenticated-User-Id") UUID userId) {
        return service.findMine(userId);
    }

    @PostMapping
    public RecruitmentResponse create(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @Valid @RequestBody RecruitmentRequest request) {
        return service.create(userId, request);
    }

    @PutMapping("/{id}")
    public RecruitmentResponse update(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody RecruitmentRequest request) {
        return service.update(userId, id, request);
    }

    @PostMapping("/{id}/publish")
    public RecruitmentResponse publish(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID id) {
        return service.publish(userId, id);
    }

    @PostMapping("/{id}/close")
    public RecruitmentResponse close(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID id) {
        return service.close(userId, id);
    }

    @PostMapping("/{id}/archive")
    public RecruitmentResponse archive(@RequestHeader("X-Authenticated-User-Id") UUID userId, @PathVariable UUID id) {
        return service.archive(userId, id);
    }

    @PostMapping("/{id}/applications")
    public ApplicationResponse apply(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationRequest request) {
        return applicationService.apply(userId, id, request);
    }

    @GetMapping("/{id}/applications")
    public List<ApplicationResponse> applications(
            @RequestHeader("X-Authenticated-User-Id") UUID userId,
            @PathVariable UUID id) {
        return applicationService.findForRecruitment(userId, id);
    }
}
