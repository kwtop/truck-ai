package com.example.b2btruck.auth;

import com.example.b2btruck.user.UserRepository;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    private final UserRepository userRepository;

    public PermissionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<String> findPermissionCodes(Long userId) {
        return userRepository.findPermissionCodes(userId);
    }

    public boolean hasPermission(Authentication authentication, String permissionCode) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return false;
        }

        return user.permissions().contains(permissionCode);
    }

    public void requirePermission(Authentication authentication, String permissionCode) {
        if (!hasPermission(authentication, permissionCode)) {
            throw new AccessDeniedException("Missing permission: " + permissionCode);
        }
    }
}
