package com.example.b2btruck.attribute;

public class VehicleAttributeDefinitionNotFoundException extends RuntimeException {

    public VehicleAttributeDefinitionNotFoundException(Long id) {
        super("Vehicle attribute definition not found: " + id);
    }
}
