package com.example.b2btruck.auth;

public class AuthFailureException extends RuntimeException {

    public AuthFailureException() {
        super("Invalid username or password");
    }
}
