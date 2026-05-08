package com.example.b2btruck.category;

public class VehicleCategoryNotFoundException extends RuntimeException {

    public VehicleCategoryNotFoundException(Long id) {
        super("Vehicle category not found: " + id);
    }
}
