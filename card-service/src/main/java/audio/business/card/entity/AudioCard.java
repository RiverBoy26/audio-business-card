package audio.business.card.entity;

import audio.business.card.enums.CardType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "audio_cards")
@Getter
@Setter
public class AudioCard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "full_name", length = 200)
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "photo_filename")
    private String photoFilename;

    @Column(name = "photo_content_type")
    private String photoContentType;

    @Column(name = "document_filename")
    private String documentFilename;

    @Column(name = "document_original_name")
    private String documentOriginalName;

    @Column(name = "voice_recording_id")
    private UUID voiceRecordingId;

    @Column(name = "music_id")
    private UUID musicId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "audio_card_skills", joinColumns = @JoinColumn(name = "audio_card_id"))
    @OrderColumn(name = "position")
    @Column(name = "skill", nullable = false, length = 50)
    private List<String> skills = new ArrayList<>();

    @OneToOne(mappedBy = "audioCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private CardSettings settings;

    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "public_code", unique = true, length = 6)
    private String publicCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    private CardType cardType;

    @Column(length = 150)
    private String desiredPosition;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
