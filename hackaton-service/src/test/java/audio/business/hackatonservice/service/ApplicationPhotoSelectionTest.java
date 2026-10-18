package audio.business.hackatonservice.service;

import audio.business.hackatonservice.entity.TeamApplication;
import audio.business.hackatonservice.entity.TeamRecruitment;
import audio.business.hackatonservice.repository.TeamApplicationRepository;
import audio.business.hackatonservice.repository.TeamRecruitmentRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ApplicationPhotoSelectionTest {
    private final TeamApplicationRepository applications = mock(TeamApplicationRepository.class);
    private final CardClient cards = mock(CardClient.class);
    private final ApplicationService service = new ApplicationService(mock(TeamRecruitmentRepository.class), applications, cards);

    @Test
    void applicationUsesSelectedProfileAvatarDirectly() {
        TeamApplication application = application();
        String avatar = "/api/v1/auth/users/" + application.getApplicantId() + "/avatar";
        when(cards.findSharedCard(application.getAudioCardId())).thenReturn(sharedCard(application, avatar));

        assertThat(service.findCard(application.getRecruitment().getCreatorId(), application.getId()).photoUrl())
                .isEqualTo(avatar);
    }

    @Test
    void applicationPhotoProxyIncludesFileRevision() {
        TeamApplication application = application();
        String photo = "/public/audio-cards/" + application.getAudioCardId() + "/photo?v=new-photo.png";
        when(cards.findSharedCard(application.getAudioCardId())).thenReturn(sharedCard(application, photo));

        assertThat(service.findCard(application.getRecruitment().getCreatorId(), application.getId()).photoUrl())
                .isEqualTo("/api/v1/applications/" + application.getId() + "/card/photo?v=new-photo.png");
    }

    private TeamApplication application() {
        TeamRecruitment recruitment = new TeamRecruitment();
        recruitment.setId(UUID.randomUUID());
        recruitment.setCreatorId(UUID.randomUUID());
        TeamApplication application = new TeamApplication();
        application.setId(UUID.randomUUID());
        application.setRecruitment(recruitment);
        application.setApplicantId(UUID.randomUUID());
        application.setAudioCardId(UUID.randomUUID());
        when(applications.findById(application.getId())).thenReturn(Optional.of(application));
        return application;
    }

    private CardClient.SharedCard sharedCard(TeamApplication application, String photoUrl) {
        return new CardClient.SharedCard(application.getAudioCardId(), "Кандидат", null, null,
                "Разработчик", null, photoUrl, null, null, List.of(), 1,
                100, 100, 0, null, null, null, null);
    }
}
