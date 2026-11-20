package audio.business.auth.service;

import audio.business.auth.dto.*;

import java.util.UUID;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshRequest request);

    void logout(LogoutRequest request);

    UserResponse getCurrentUser(UUID userId);

    UserResponse updateCurrentUser(
            UUID userId,
            UpdateProfileRequest request
    );
}
