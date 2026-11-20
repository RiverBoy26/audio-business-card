package audio.business.hackatonservice.entity;

import audio.business.hackatonservice.model.EventFormat;
import audio.business.hackatonservice.model.RecruitmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "team_recruitments")
@Getter
@Setter
public class TeamRecruitment {
    @Id
    private UUID id;

    @Column(name = "creator_id", nullable = false)
    private UUID creatorId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "event_name", nullable = false, length = 150)
    private String eventName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "participants_needed", nullable = false)
    private int participantsNeeded;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "team_recruitment_skills", joinColumns = @JoinColumn(name = "recruitment_id"))
    @Column(name = "skill", nullable = false, length = 50)
    private Set<String> requiredSkills = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "event_format", nullable = false, length = 20)
    private EventFormat format;

    @Column(length = 255)
    private String location;

    @Column(name = "event_url", length = 500)
    private String eventUrl;

    @Column(nullable = false)
    private Instant deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecruitmentStatus status;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = RecruitmentStatus.DRAFT;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
