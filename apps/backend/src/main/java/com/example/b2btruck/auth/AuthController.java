package com.example.b2btruck.auth;

import java.security.Principal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {

    private final AuthService authService;
    private final PermissionService permissionService;

    public AuthController(AuthService authService, PermissionService permissionService) {
        this.authService = authService;
        this.permissionService = permissionService;
    }

    @PostMapping("/login")
    LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    LoginUserResponse me(Principal principal) {
        AuthenticatedUser user = (AuthenticatedUser) ((Authentication) principal).getPrincipal();
        return new LoginUserResponse(user.id(), user.username(), user.displayName());
    }

    @GetMapping("/permission-check")
    PermissionCheckResponse permissionCheck(Authentication authentication, @RequestParam String permission) {
        permissionService.requirePermission(authentication, permission);
        return new PermissionCheckResponse(permission, true);
    }
}
