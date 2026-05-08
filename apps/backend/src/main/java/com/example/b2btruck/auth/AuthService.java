package com.example.b2btruck.auth;

import com.example.b2btruck.user.UserAccount;
import com.example.b2btruck.user.UserRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final PermissionService permissionService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            PermissionService permissionService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.permissionService = permissionService;
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || isBlank(request.username()) || isBlank(request.password())) {
            throw new AuthFailureException();
        }

        UserAccount user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(AuthFailureException::new);

        if (!ACTIVE_STATUS.equals(user.status()) || !passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new AuthFailureException();
        }

        List<String> permissions = permissionService.findPermissionCodes(user.id());
        String token = jwtTokenService.createToken(user, permissions);
        userRepository.markLastLogin(user.id());

        return new LoginResponse(
                token,
                "Bearer",
                jwtTokenService.expirationSeconds(),
                new LoginUserResponse(user.id(), user.username(), user.displayName()),
                permissions
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
