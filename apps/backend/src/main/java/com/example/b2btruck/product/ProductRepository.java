package com.example.b2btruck.product;

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
public class ProductRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProductRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Product save(CreateProductCommand command) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into product (
                                        category_id,
                                        sku,
                                        slug,
                                        default_name,
                                        default_summary,
                                        status,
                                        specs,
                                        seo_config,
                                        shipping_config,
                                        ai_enabled,
                                        featured,
                                        sort_order,
                                        published_at,
                                        created_by,
                                        updated_by
                                    )
                                    values (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?, ?, ?, case when ? = 'PUBLISHED' then now() else null end, ?, ?)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setLong(1, command.categoryId());
                    statement.setString(2, command.sku());
                    statement.setString(3, command.slug());
                    statement.setString(4, command.defaultName());
                    statement.setString(5, command.defaultSummary());
                    statement.setString(6, command.status());
                    statement.setString(7, defaultJson(command.specs()));
                    statement.setString(8, defaultJson(command.seoConfig()));
                    statement.setString(9, defaultJson(command.shippingConfig()));
                    statement.setBoolean(10, command.aiEnabled());
                    statement.setBoolean(11, command.featured());
                    statement.setInt(12, command.sortOrder());
                    statement.setString(13, command.status());
                    statement.setObject(14, command.createdBy());
                    statement.setObject(15, command.createdBy());
                    return statement;
                },
                keyHolder
        );

        Number id = keyHolder.getKey();
        if (id == null) {
            throw new IllegalStateException("Product id was not generated");
        }

        return findById(id.longValue()).orElseThrow();
    }

    public Optional<Product> findById(Long id) {
        List<Product> products = jdbcTemplate.query(
                """
                        select *
                        from product
                        where id = ? and deleted_at is null
                        """,
                this::mapProduct,
                id
        );

        return products.stream().findFirst();
    }

    public List<Product> findAll(Long categoryId, String keyword, String status) {
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : "%" + keyword.trim().toLowerCase() + "%";
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim();

        return jdbcTemplate.query(
                """
                        select *
                        from product
                        where deleted_at is null
                          and (? is null or category_id = ?)
                          and (? is null or lower(sku) like ? or lower(slug) like ? or lower(default_name) like ?)
                          and (? is null or status = ?)
                        order by sort_order, id
                        """,
                this::mapProduct,
                categoryId,
                categoryId,
                normalizedKeyword,
                normalizedKeyword,
                normalizedKeyword,
                normalizedKeyword,
                normalizedStatus,
                normalizedStatus
        );
    }

    public Product update(Long id, UpdateProductCommand command) {
        int updated = jdbcTemplate.update(
                """
                        update product
                        set category_id = ?,
                            sku = ?,
                            slug = ?,
                            default_name = ?,
                            default_summary = ?,
                            status = ?,
                            specs = ?::jsonb,
                            seo_config = ?::jsonb,
                            shipping_config = ?::jsonb,
                            ai_enabled = ?,
                            featured = ?,
                            sort_order = ?,
                            published_at = case
                                when ? = 'PUBLISHED' and published_at is null then now()
                                when ? <> 'PUBLISHED' then null
                                else published_at
                            end,
                            updated_by = ?,
                            updated_at = now()
                        where id = ?
                          and deleted_at is null
                        """,
                command.categoryId(),
                command.sku(),
                command.slug(),
                command.defaultName(),
                command.defaultSummary(),
                command.status(),
                defaultJson(command.specs()),
                defaultJson(command.seoConfig()),
                defaultJson(command.shippingConfig()),
                command.aiEnabled(),
                command.featured(),
                command.sortOrder(),
                command.status(),
                command.status(),
                command.updatedBy(),
                id
        );

        if (updated != 1) {
            throw new ProductNotFoundException(id);
        }

        return findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    public void delete(Long id, Long updatedBy) {
        int updated = jdbcTemplate.update(
                """
                        update product
                        set deleted_at = now(),
                            updated_by = ?,
                            updated_at = now()
                        where id = ?
                          and deleted_at is null
                        """,
                updatedBy,
                id
        );

        if (updated != 1) {
            throw new ProductNotFoundException(id);
        }
    }

    private Product mapProduct(ResultSet resultSet, int rowNum) throws SQLException {
        return new Product(
                resultSet.getLong("id"),
                resultSet.getLong("category_id"),
                resultSet.getString("sku"),
                resultSet.getString("slug"),
                resultSet.getString("default_name"),
                resultSet.getString("default_summary"),
                resultSet.getString("status"),
                resultSet.getString("specs"),
                resultSet.getString("seo_config"),
                resultSet.getString("shipping_config"),
                resultSet.getBoolean("ai_enabled"),
                resultSet.getBoolean("featured"),
                resultSet.getInt("sort_order"),
                toOffsetDateTime(resultSet.getTimestamp("published_at")),
                resultSet.getObject("created_by", Long.class),
                resultSet.getObject("updated_by", Long.class),
                toOffsetDateTime(resultSet.getTimestamp("created_at")),
                toOffsetDateTime(resultSet.getTimestamp("updated_at"))
        );
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(ZoneOffset.UTC);
    }

    private String defaultJson(String value) {
        return value == null || value.isBlank() ? "{}" : value;
    }
}
