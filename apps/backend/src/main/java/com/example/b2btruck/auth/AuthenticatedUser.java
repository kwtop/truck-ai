package com.example.b2btruck.auth;

import java.util.List;

public record AuthenticatedUser(
        Long id,
        String username,
        String displayName,
        List<String> permissions
) {
}
