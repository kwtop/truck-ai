package com.example.b2btruck.user;

public record UserAccount(
        Long id,
        String username,
        String passwordHash,
        String displayName,
        String status
) {
}
