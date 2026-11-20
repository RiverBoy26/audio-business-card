package audio.business.card.service.interfaces;

import audio.business.card.dto.request.CardStackRequest;
import audio.business.card.dto.response.CardStackResponse;

import java.util.List;
import java.util.UUID;

public interface CardStackService {

    List<CardStackResponse> findAll(UUID userId, UUID audioCardId);

    List<CardStackResponse> add(UUID userId, UUID audioCardId, CardStackRequest request);

    void delete(UUID userId, UUID audioCardId, UUID stackId);
}