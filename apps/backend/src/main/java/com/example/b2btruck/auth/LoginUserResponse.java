package com.example.b2btruck.auth;

public record LoginUserResponse(
        Long id,
        String username,
        String displayName
) {
}
