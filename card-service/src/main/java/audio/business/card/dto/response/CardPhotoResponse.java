package audio.business.card.dto.response;

import org.springframework.core.io.Resource;

public record CardPhotoResponse(Resource resource, String contentType) { }
