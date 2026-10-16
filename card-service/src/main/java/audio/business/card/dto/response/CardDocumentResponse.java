package audio.business.card.dto.response;

import org.springframework.core.io.Resource;

public record CardDocumentResponse(Resource resource, String contentType, String originalFilename) { }
