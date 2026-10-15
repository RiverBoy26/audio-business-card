package audio.business.card.service.interfaces;

import audio.business.card.dto.request.CardSphereRequest;
import audio.business.card.dto.response.CardSphereResponse;

import java.util.List;
import java.util.UUID;

public interface CardSphereService {

    List<CardSphereResponse> findAll(UUID userId, UUID audioCardId);

    List<CardSphereResponse> add(UUID userId, UUID audioCardId, CardSphereRequest request);

    void delete(UUID userId, UUID audioCardId, UUID sphereId);
}