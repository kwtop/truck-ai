package com.example.b2btruck.auth;

public record PermissionCheckResponse(
        String permission,
        boolean allowed
) {
}
