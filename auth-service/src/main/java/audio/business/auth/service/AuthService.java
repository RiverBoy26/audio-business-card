package audio.business.auth.service;

import audio.business.auth.dto.AuthResponse;
import audio.business.auth.dto.LoginRequest;
import audio.business.auth.dto.LogoutRequest;
import audio.business.auth.dto.RefreshRequest;
import audio.business.auth.dto.RegisterRequest;
import audio.business.auth.dto.UserResponse;

import java.util.UUID;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshRequest request);

    void logout(LogoutRequest request);

    UserResponse getCurrentUser(UUID userId);
}
