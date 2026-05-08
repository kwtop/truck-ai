package com.example.b2btruck.category;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class VehicleCategoryRepositoryTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private VehicleCategoryRepository vehicleCategoryRepository;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
    }

    @Test
    void savesTreeCategoryAndFindsChildrenByParentId() {
        VehicleCategory trucks = vehicleCategoryRepository.save(new CreateVehicleCategoryCommand(
                null,
                "TRUCKS",
                "trucks",
                "Trucks",
                "Commercial trucks",
                "ACTIVE",
                10,
                "{\"title\":\"Truck categories\"}",
                "{\"icon\":\"truck\"}"
        ));
        VehicleCategory tankTruck = vehicleCategoryRepository.save(new CreateVehicleCategoryCommand(
                trucks.id(),
                "TANK_TRUCK",
                "tank-truck",
                "Tank Truck",
                "Fuel and water tank trucks",
                "ACTIVE",
                20,
                "{}",
                "{}"
        ));

        List<VehicleCategory> children = vehicleCategoryRepository.findByParentId(trucks.id());

        assertThat(trucks.parentId()).isNull();
        assertThat(tankTruck.parentId()).isEqualTo(trucks.id());
        assertThat(children).extracting(VehicleCategory::code).containsExactly("TANK_TRUCK");
        assertThat(children.get(0).slug()).isEqualTo("tank-truck");
    }
}
