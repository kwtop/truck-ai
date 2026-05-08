package com.example.b2btruck.common.api;

import com.example.b2btruck.auth.AuthFailureException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.example.b2btruck")
public class ApiExceptionHandler {

    @ExceptionHandler(AuthFailureException.class)
    ResponseEntity<ApiResponse<Void>> handleAuthFailure(
            AuthFailureException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.failure(
                        new ApiError("AUTH_INVALID_CREDENTIALS", exception.getMessage()),
                        resolveRequestId(request)
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDenied(
            AccessDeniedException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.failure(
                        new ApiError("AUTH_FORBIDDEN", exception.getMessage()),
                        resolveRequestId(request)
                ));
    }

    private String resolveRequestId(HttpServletRequest request) {
        Object requestId = request.getAttribute(RequestIdFilter.REQUEST_ID_ATTRIBUTE);
        return requestId instanceof String value ? value : null;
    }
}
