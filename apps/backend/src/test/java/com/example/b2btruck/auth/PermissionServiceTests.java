package com.example.b2btruck.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.b2btruck.user.UserRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

class PermissionServiceTests {

    private final UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
    private final PermissionService permissionService = new PermissionService(userRepository);

    @Test
    void findsPermissionCodesThroughRepositoryAggregation() {
        when(userRepository.findPermissionCodes(10L)).thenReturn(List.of("dashboard:read", "lead:read"));

        List<String> permissions = permissionService.findPermissionCodes(10L);

        assertThat(permissions).containsExactly("dashboard:read", "lead:read");
        verify(userRepository).findPermissionCodes(10L);
    }

    @Test
    void detectsPermissionFromAuthenticatedUser() {
        UsernamePasswordAuthenticationToken authentication = authenticationWithPermissions("dashboard:read");

        assertThat(permissionService.hasPermission(authentication, "dashboard:read")).isTrue();
        assertThat(permissionService.hasPermission(authentication, "lead:write")).isFalse();
    }

    @Test
    void requirePermissionRejectsMissingPermission() {
        UsernamePasswordAuthenticationToken authentication = authenticationWithPermissions("lead:read");

        assertThatThrownBy(() -> permissionService.requirePermission(authentication, "dashboard:read"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Missing permission: dashboard:read");
    }

    private UsernamePasswordAuthenticationToken authenticationWithPermissions(String... permissions) {
        AuthenticatedUser user = new AuthenticatedUser(10L, "admin", "Admin", List.of(permissions));
        return new UsernamePasswordAuthenticationToken(user, null);
    }
}
