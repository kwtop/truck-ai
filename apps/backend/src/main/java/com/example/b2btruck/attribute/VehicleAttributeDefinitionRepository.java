package com.example.b2btruck.attribute;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class VehicleAttributeDefinitionRepository {

    private final JdbcTemplate jdbcTemplate;

    public VehicleAttributeDefinitionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public VehicleAttributeDefinition save(CreateVehicleAttributeDefinitionCommand command) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into vehicle_attribute_definition (
                                        category_id,
                                        code,
                                        default_label,
                                        data_type,
                                        unit,
                                        options,
                                        validation_rules,
                                        ui_config,
                                        required,
                                        filterable,
                                        comparable,
                                        sort_order,
                                        status
                                    )
                                    values (?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?, ?, ?, ?, ?)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setLong(1, command.categoryId());
                    statement.setString(2, command.code());
                    statement.setString(3, command.defaultLabel());
                    statement.setString(4, command.dataType());
                    statement.setString(5, command.unit());
                    statement.setString(6, defaultJsonArray(command.options()));
                    statement.setString(7, defaultJsonObject(command.validationRules()));
                    statement.setString(8, defaultJsonObject(command.uiConfig()));
                    statement.setBoolean(9, command.required());
                    statement.setBoolean(10, command.filterable());
                    statement.setBoolean(11, command.comparable());
                    statement.setInt(12, command.sortOrder());
                    statement.setString(13, command.status());
                    return statement;
                },
                keyHolder
        );

        Number id = keyHolder.getKey();
        if (id == null) {
            throw new IllegalStateException("Vehicle attribute definition id was not generated");
        }

        return findById(id.longValue()).orElseThrow();
    }

    public Optional<VehicleAttributeDefinition> findById(Long id) {
        List<VehicleAttributeDefinition> definitions = jdbcTemplate.query(
                """
                        select *
                        from vehicle_attribute_definition
                        where id = ?
                        """,
                this::mapDefinition,
                id
        );

        return definitions.stream().findFirst();
    }

    public List<VehicleAttributeDefinition> findByCategoryId(Long categoryId) {
        return jdbcTemplate.query(
                """
                        select *
                        from vehicle_attribute_definition
                        where category_id = ?
                        order by sort_order, id
                        """,
                this::mapDefinition,
                categoryId
        );
    }

    public VehicleAttributeDefinition update(Long id, UpdateVehicleAttributeDefinitionCommand command) {
        int updated = jdbcTemplate.update(
                """
                        update vehicle_attribute_definition
                        set category_id = ?,
                            code = ?,
                            default_label = ?,
                            data_type = ?,
                            unit = ?,
                            options = ?::jsonb,
                            validation_rules = ?::jsonb,
                            ui_config = ?::jsonb,
                            required = ?,
                            filterable = ?,
                            comparable = ?,
                            sort_order = ?,
                            status = ?,
                            updated_at = now()
                        where id = ?
                        """,
                command.categoryId(),
                command.code(),
                command.defaultLabel(),
                command.dataType(),
                command.unit(),
                defaultJsonArray(command.options()),
                defaultJsonObject(command.validationRules()),
                defaultJsonObject(command.uiConfig()),
                command.required(),
                command.filterable(),
                command.comparable(),
                command.sortOrder(),
                command.status(),
                id
        );

        if (updated != 1) {
            throw new VehicleAttributeDefinitionNotFoundException(id);
        }

        return findById(id).orElseThrow(() -> new VehicleAttributeDefinitionNotFoundException(id));
    }

    private VehicleAttributeDefinition mapDefinition(ResultSet resultSet, int rowNum) throws SQLException {
        return new VehicleAttributeDefinition(
                resultSet.getLong("id"),
                resultSet.getLong("category_id"),
                resultSet.getString("code"),
                resultSet.getString("default_label"),
                resultSet.getString("data_type"),
                resultSet.getString("unit"),
                resultSet.getString("options"),
                resultSet.getString("validation_rules"),
                resultSet.getString("ui_config"),
                resultSet.getBoolean("required"),
                resultSet.getBoolean("filterable"),
                resultSet.getBoolean("comparable"),
                resultSet.getInt("sort_order"),
                resultSet.getString("status"),
                toOffsetDateTime(resultSet.getTimestamp("created_at")),
                toOffsetDateTime(resultSet.getTimestamp("updated_at"))
        );
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        return timestamp.toInstant().atOffset(ZoneOffset.UTC);
    }

    private String defaultJsonObject(String value) {
        return value == null || value.isBlank() ? "{}" : value;
    }

    private String defaultJsonArray(String value) {
        return value == null || value.isBlank() ? "[]" : value;
    }
}
