package com.example.b2btruck.auth;

import java.util.List;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn,
        LoginUserResponse user,
        List<String> permissions
) {
}
