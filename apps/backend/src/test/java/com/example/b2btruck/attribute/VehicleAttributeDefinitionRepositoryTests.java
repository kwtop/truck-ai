package com.example.b2btruck.attribute;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.b2btruck.category.CreateVehicleCategoryCommand;
import com.example.b2btruck.category.VehicleCategory;
import com.example.b2btruck.category.VehicleCategoryRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class VehicleAttributeDefinitionRepositoryTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private VehicleCategoryRepository vehicleCategoryRepository;

    @Autowired
    private VehicleAttributeDefinitionRepository vehicleAttributeDefinitionRepository;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
    }

    @Test
    void savesAndFindsDefinitionsByCategoryId() {
        VehicleCategory category = createCategory();

        VehicleAttributeDefinition capacity = vehicleAttributeDefinitionRepository.save(
                new CreateVehicleAttributeDefinitionCommand(
                        category.id(),
                        "tank_capacity",
                        "Tank Capacity",
                        "number",
                        "L",
                        "[]",
                        "{\"min\":1000,\"max\":50000}",
                        "{\"widget\":\"number\"}",
                        true,
                        true,
                        true,
                        10,
                        "ACTIVE"
                )
        );
        vehicleAttributeDefinitionRepository.save(new CreateVehicleAttributeDefinitionCommand(
                category.id(),
                "tank_material",
                "Tank Material",
                "select",
                null,
                "[\"Carbon Steel\",\"Stainless Steel\",\"Aluminum Alloy\"]",
                "{}",
                "{}",
                true,
                true,
                false,
                20,
                "ACTIVE"
        ));

        List<VehicleAttributeDefinition> definitions =
                vehicleAttributeDefinitionRepository.findByCategoryId(category.id());

        assertThat(capacity.id()).isNotNull();
        assertThat(capacity.required()).isTrue();
        assertThat(capacity.filterable()).isTrue();
        assertThat(capacity.comparable()).isTrue();
        assertThat(capacity.validationRules()).contains("min").contains("1000");
        assertThat(definitions).extracting(VehicleAttributeDefinition::code)
                .containsExactly("tank_capacity", "tank_material");
        assertThat(definitions.get(1).options()).contains("Carbon Steel");
    }

    @Test
    void updatesDefinitionMetadataAndStatus() {
        VehicleCategory category = createCategory();
        VehicleAttributeDefinition definition = vehicleAttributeDefinitionRepository.save(
                new CreateVehicleAttributeDefinitionCommand(
                        category.id(),
                        "emission_standard",
                        "Emission Standard",
                        "select",
                        null,
                        "[\"Euro II\",\"Euro III\"]",
                        "{}",
                        "{}",
                        false,
                        true,
                        true,
                        30,
                        "ACTIVE"
                )
        );

        VehicleAttributeDefinition updated = vehicleAttributeDefinitionRepository.update(
                definition.id(),
                new UpdateVehicleAttributeDefinitionCommand(
                        category.id(),
                        "emission_standard",
                        "Emission Standard",
                        "multi_select",
                        null,
                        "[\"Euro II\",\"Euro III\",\"Euro V\"]",
                        "{}",
                        "{\"help\":\"Choose one or more standards\"}",
                        true,
                        true,
                        false,
                        5,
                        "DISABLED"
                )
        );

        assertThat(updated.dataType()).isEqualTo("multi_select");
        assertThat(updated.required()).isTrue();
        assertThat(updated.comparable()).isFalse();
        assertThat(updated.sortOrder()).isEqualTo(5);
        assertThat(updated.status()).isEqualTo("DISABLED");
        assertThat(updated.uiConfig()).contains("Choose one or more standards");
    }

    @Test
    void enforcesUniqueCodeWithinCategory() {
        VehicleCategory category = createCategory();
        CreateVehicleAttributeDefinitionCommand command = new CreateVehicleAttributeDefinitionCommand(
                category.id(),
                "tank_capacity",
                "Tank Capacity",
                "number",
                "L",
                "[]",
                "{}",
                "{}",
                false,
                false,
                false,
                10,
                "ACTIVE"
        );

        vehicleAttributeDefinitionRepository.save(command);

        assertThatThrownBy(() -> vehicleAttributeDefinitionRepository.save(command))
                .isInstanceOf(DuplicateKeyException.class);
    }

    private VehicleCategory createCategory() {
        return vehicleCategoryRepository.save(new CreateVehicleCategoryCommand(
                null,
                "FUEL_TANK_TRUCK",
                "fuel-tank-truck",
                "Fuel Tank Truck",
                "Fuel and water tank trucks",
                "ACTIVE",
                10,
                "{}",
                "{}"
        ));
    }
}
