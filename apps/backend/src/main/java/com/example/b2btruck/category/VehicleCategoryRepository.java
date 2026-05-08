package com.example.b2btruck.category;

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
public class VehicleCategoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public VehicleCategoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public VehicleCategory save(CreateVehicleCategoryCommand command) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into vehicle_category (
                                        parent_id,
                                        code,
                                        slug,
                                        default_name,
                                        default_description,
                                        status,
                                        sort_order,
                                        seo_config,
                                        display_config
                                    )
                                    values (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setObject(1, command.parentId());
                    statement.setString(2, command.code());
                    statement.setString(3, command.slug());
                    statement.setString(4, command.defaultName());
                    statement.setString(5, command.defaultDescription());
                    statement.setString(6, command.status());
                    statement.setInt(7, command.sortOrder());
                    statement.setString(8, defaultJson(command.seoConfig()));
                    statement.setString(9, defaultJson(command.displayConfig()));
                    return statement;
                },
                keyHolder
        );

        Number id = keyHolder.getKey();
        if (id == null) {
            throw new IllegalStateException("Vehicle category id was not generated");
        }

        return findById(id.longValue()).orElseThrow();
    }

    public Optional<VehicleCategory> findById(Long id) {
        List<VehicleCategory> categories = jdbcTemplate.query(
                """
                        select *
                        from vehicle_category
                        where id = ? and deleted_at is null
                        """,
                this::mapCategory,
                id
        );

        return categories.stream().findFirst();
    }

    public List<VehicleCategory> findAll(String keyword, String status) {
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : "%" + keyword.trim().toLowerCase() + "%";
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim();

        return jdbcTemplate.query(
                """
                        select *
                        from vehicle_category
                        where deleted_at is null
                          and (? is null or lower(code) like ? or lower(slug) like ? or lower(default_name) like ?)
                          and (? is null or status = ?)
                        order by parent_id nulls first, sort_order, id
                        """,
                this::mapCategory,
                normalizedKeyword,
                normalizedKeyword,
                normalizedKeyword,
                normalizedKeyword,
                normalizedStatus,
                normalizedStatus
        );
    }

    public List<VehicleCategory> findByParentId(Long parentId) {
        return jdbcTemplate.query(
                """
                        select *
                        from vehicle_category
                        where parent_id = ?
                          and deleted_at is null
                        order by sort_order, id
                        """,
                this::mapCategory,
                parentId
        );
    }

    public VehicleCategory update(Long id, UpdateVehicleCategoryCommand command) {
        int updated = jdbcTemplate.update(
                """
                        update vehicle_category
                        set parent_id = ?,
                            code = ?,
                            slug = ?,
                            default_name = ?,
                            default_description = ?,
                            status = ?,
                            sort_order = ?,
                            seo_config = ?::jsonb,
                            display_config = ?::jsonb,
                            updated_at = now()
                        where id = ?
                          and deleted_at is null
                        """,
                command.parentId(),
                command.code(),
                command.slug(),
                command.defaultName(),
                command.defaultDescription(),
                command.status(),
                command.sortOrder(),
                defaultJson(command.seoConfig()),
                defaultJson(command.displayConfig()),
                id
        );

        if (updated != 1) {
            throw new VehicleCategoryNotFoundException(id);
        }

        return findById(id).orElseThrow(() -> new VehicleCategoryNotFoundException(id));
    }

    private VehicleCategory mapCategory(ResultSet resultSet, int rowNum) throws SQLException {
        return new VehicleCategory(
                resultSet.getLong("id"),
                resultSet.getObject("parent_id", Long.class),
                resultSet.getString("code"),
                resultSet.getString("slug"),
                resultSet.getString("default_name"),
                resultSet.getString("default_description"),
                resultSet.getString("status"),
                resultSet.getInt("sort_order"),
                resultSet.getString("seo_config"),
                resultSet.getString("display_config"),
                toOffsetDateTime(resultSet.getTimestamp("created_at")),
                toOffsetDateTime(resultSet.getTimestamp("updated_at"))
        );
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        return timestamp.toInstant().atOffset(ZoneOffset.UTC);
    }

    private String defaultJson(String value) {
        return value == null || value.isBlank() ? "{}" : value;
    }
}
