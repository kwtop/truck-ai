package com.example.b2btruck.product;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.example.b2btruck.attribute.VehicleAttributeDefinition;
import com.example.b2btruck.attribute.VehicleAttributeDefinitionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class ProductSpecValidatorTests {

    private VehicleAttributeDefinitionRepository attributeRepository;
    private ProductSpecValidator validator;

    @BeforeEach
    void setUp() {
        attributeRepository = Mockito.mock(VehicleAttributeDefinitionRepository.class);
        validator = new ProductSpecValidator(attributeRepository, new ObjectMapper());
    }

    @Test
    void acceptsSpecsThatMatchCategoryAttributeDefinitions() {
        when(attributeRepository.findByCategoryId(10L)).thenReturn(List.of(
                definition("tank_capacity", "number", "L", "[]", "{\"min\":1000,\"max\":50000}", true),
                definition("tank_material", "select", null, "[\"Carbon Steel\",\"Stainless Steel\"]", "{}", true),
                definition("emission_standard", "multi_select", null, "[\"Euro III\",\"Euro V\"]", "{}", false),
                definition("has_pump", "boolean", null, "[]", "{}", false),
                definition("operating_temperature", "range", "C", "[]", "{\"min\":-40,\"max\":80}", false),
                definition("chassis_brand", "text", null, "[]", "{\"regex\":\"^[A-Za-z0-9 -]+$\"}", true)
        ));

        assertThatCode(() -> validator.validate(
                10L,
                """
                        {
                          "tank_capacity": 10000,
                          "tank_material": "Carbon Steel",
                          "emission_standard": ["Euro III", "Euro V"],
                          "has_pump": true,
                          "operating_temperature": {"min": -20, "max": 60},
                          "chassis_brand": "Sinotruk HOWO"
                        }
                        """
        )).doesNotThrowAnyException();
    }

    @Test
    void rejectsMissingRequiredSpecsAndUnknownFields() {
        when(attributeRepository.findByCategoryId(10L)).thenReturn(List.of(
                definition("tank_capacity", "number", "L", "[]", "{}", true)
        ));

        assertThatThrownBy(() -> validator.validate(10L, "{\"unknown_spec\":\"value\"}"))
                .isInstanceOf(ProductSpecValidationException.class)
                .hasMessageContaining("tank_capacity is required")
                .hasMessageContaining("unknown_spec is not defined");
    }

    @Test
    void rejectsInvalidNumberBounds() {
        when(attributeRepository.findByCategoryId(10L)).thenReturn(List.of(
                definition("tank_capacity", "number", "L", "[]", "{\"min\":1000,\"max\":50000}", true)
        ));

        assertThatThrownBy(() -> validator.validate(10L, "{\"tank_capacity\":500}"))
                .isInstanceOf(ProductSpecValidationException.class)
                .hasMessageContaining("tank_capacity must be greater than or equal to 1000");
    }

    @Test
    void rejectsInvalidSelectAndMultiSelectOptions() {
        when(attributeRepository.findByCategoryId(10L)).thenReturn(List.of(
                definition("tank_material", "select", null, "[\"Carbon Steel\"]", "{}", true),
                definition("emission_standard", "multi_select", null, "[\"Euro III\"]", "{}", false)
        ));

        assertThatThrownBy(() -> validator.validate(
                10L,
                "{\"tank_material\":\"Aluminum\",\"emission_standard\":[\"Euro V\"]}"
        ))
                .isInstanceOf(ProductSpecValidationException.class)
                .hasMessageContaining("tank_material must be one of configured options")
                .hasMessageContaining("emission_standard contains an option that is not configured");
    }

    @Test
    void rejectsWrongJsonShapesAndScalarTypes() {
        when(attributeRepository.findByCategoryId(10L)).thenReturn(List.of(
                definition("has_pump", "boolean", null, "[]", "{}", true),
                definition("operating_temperature", "range", "C", "[]", "{}", true)
        ));

        assertThatThrownBy(() -> validator.validate(
                10L,
                "{\"has_pump\":\"yes\",\"operating_temperature\":[1,2]}"
        ))
                .isInstanceOf(ProductSpecValidationException.class)
                .hasMessageContaining("has_pump must be boolean")
                .hasMessageContaining("operating_temperature must be an object with numeric min and max");
    }

    @Test
    void ignoresDisabledAttributeDefinitions() {
        when(attributeRepository.findByCategoryId(10L)).thenReturn(List.of(
                disabledDefinition("legacy_spec", "text")
        ));

        assertThatThrownBy(() -> validator.validate(10L, "{\"legacy_spec\":\"value\"}"))
                .isInstanceOf(ProductSpecValidationException.class)
                .hasMessageContaining("legacy_spec is not defined");
    }

    @Test
    void rejectsInvalidSpecsJson() {
        assertThatThrownBy(() -> validator.validate(10L, "[]"))
                .isInstanceOf(ProductSpecValidationException.class)
                .hasMessageContaining("specs must be a JSON object");

        assertThatThrownBy(() -> validator.validate(10L, "{"))
                .isInstanceOf(ProductSpecValidationException.class)
                .hasMessageContaining("specs must be valid JSON");
    }

    private VehicleAttributeDefinition definition(
            String code,
            String dataType,
            String unit,
            String options,
            String validationRules,
            boolean required
    ) {
        return new VehicleAttributeDefinition(
                1L,
                10L,
                code,
                code,
                dataType,
                unit,
                options,
                validationRules,
                "{}",
                required,
                true,
                true,
                10,
                "ACTIVE",
                OffsetDateTime.now(),
                OffsetDateTime.now()
        );
    }

    private VehicleAttributeDefinition disabledDefinition(String code, String dataType) {
        return new VehicleAttributeDefinition(
                1L,
                10L,
                code,
                code,
                dataType,
                null,
                "[]",
                "{}",
                "{}",
                false,
                false,
                false,
                10,
                "DISABLED",
                OffsetDateTime.now(),
                OffsetDateTime.now()
        );
    }
}
