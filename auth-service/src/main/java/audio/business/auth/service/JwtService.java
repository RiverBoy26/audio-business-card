package audio.business.auth.service;

import audio.business.auth.entity.User;

public interface JwtService {
    String generateAccessToken(User user);

    long getAccessTokenTtlSeconds();
}
