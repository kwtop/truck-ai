package com.example.b2btruck.common.api;

import com.example.b2btruck.auth.AuthFailureException;
import com.example.b2btruck.attribute.VehicleAttributeDefinitionNotFoundException;
import com.example.b2btruck.category.VehicleCategoryNotFoundException;
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

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiResponse<Void>> handleBadRequest(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.failure(
                        new ApiError("BAD_REQUEST", exception.getMessage()),
                        resolveRequestId(request)
                ));
    }

    @ExceptionHandler(VehicleCategoryNotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleCategoryNotFound(
            VehicleCategoryNotFoundException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.failure(
                        new ApiError("CATEGORY_NOT_FOUND", exception.getMessage()),
                        resolveRequestId(request)
                ));
    }

    @ExceptionHandler(VehicleAttributeDefinitionNotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleAttributeDefinitionNotFound(
            VehicleAttributeDefinitionNotFoundException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.failure(
                        new ApiError("ATTRIBUTE_NOT_FOUND", exception.getMessage()),
                        resolveRequestId(request)
                ));
    }

    private String resolveRequestId(HttpServletRequest request) {
        Object requestId = request.getAttribute(RequestIdFilter.REQUEST_ID_ATTRIBUTE);
        return requestId instanceof String value ? value : null;
    }
}
