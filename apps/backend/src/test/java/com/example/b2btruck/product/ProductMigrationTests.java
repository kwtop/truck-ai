package com.example.b2btruck.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ProductMigrationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from product_translation");
        jdbcTemplate.update("delete from product");
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
    }

    @Test
    void createsProductAndTranslationTables() {
        assertThat(tableExists("product")).isTrue();
        assertThat(tableExists("product_translation")).isTrue();
        assertThat(columnExists("product", "specs")).isTrue();
        assertThat(columnExists("product", "seo_config")).isTrue();
        assertThat(columnExists("product", "shipping_config")).isTrue();
        assertThat(columnExists("product_translation", "localized_specs")).isTrue();
    }

    @Test
    void enforcesProductSlugAndTranslationLocaleConstraints() {
        Long categoryId = createCategory();
        Long productId = createProduct(categoryId, "SKU-10000L", "fuel-tank-truck-10000l");

        jdbcTemplate.update(
                """
                        insert into product_translation (product_id, locale, name, localized_specs)
                        values (?, 'en-US', '10,000L Fuel Tank Truck', ?::jsonb)
                        """,
                productId,
                "{\"tank_capacity\":\"10000L\"}"
        );

        assertThatThrownBy(() -> createProduct(categoryId, "SKU-DUP", "fuel-tank-truck-10000l"))
                .isInstanceOf(DuplicateKeyException.class);
        assertThatThrownBy(() -> jdbcTemplate.update(
                """
                        insert into product_translation (product_id, locale, name)
                        values (?, 'en-US', 'Duplicate English Translation')
                        """,
                productId
        )).isInstanceOf(DuplicateKeyException.class);
    }

    @Test
    void deletesTranslationsWhenProductIsDeleted() {
        Long categoryId = createCategory();
        Long productId = createProduct(categoryId, "SKU-10000L", "fuel-tank-truck-10000l");
        jdbcTemplate.update(
                """
                        insert into product_translation (product_id, locale, name)
                        values (?, 'en-US', '10,000L Fuel Tank Truck')
                        """,
                productId
        );

        jdbcTemplate.update("delete from product where id = ?", productId);

        Integer translations = jdbcTemplate.queryForObject(
                "select count(*) from product_translation where product_id = ?",
                Integer.class,
                productId
        );
        assertThat(translations).isZero();
    }

    private Long createCategory() {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into vehicle_category (
                                        code,
                                        slug,
                                        default_name,
                                        status,
                                        seo_config,
                                        display_config
                                    )
                                    values ('FUEL_TANK_TRUCK', 'fuel-tank-truck', 'Fuel Tank Truck', 'ACTIVE', '{}'::jsonb, '{}'::jsonb)
                                    """,
                            new String[]{"id"}
                    );
                    return statement;
                },
                keyHolder
        );
        return keyHolder.getKey().longValue();
    }

    private Long createProduct(Long categoryId, String sku, String slug) {
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
                                        specs,
                                        seo_config,
                                        shipping_config
                                    )
                                    values (?, ?, ?, '10,000L Fuel Tank Truck', ?::jsonb, '{}'::jsonb, '{}'::jsonb)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setLong(1, categoryId);
                    statement.setString(2, sku);
                    statement.setString(3, slug);
                    statement.setString(4, "{\"tank_capacity\":10000}");
                    return statement;
                },
                keyHolder
        );
        return keyHolder.getKey().longValue();
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        select count(*)
                        from information_schema.tables
                        where table_schema = 'public' and table_name = ?
                        """,
                Integer.class,
                tableName.toLowerCase()
        );

        return count != null && count == 1;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        select count(*)
                        from information_schema.columns
                        where table_schema = 'public' and table_name = ? and column_name = ?
                        """,
                Integer.class,
                tableName.toLowerCase(),
                columnName
        );

        return count != null && count == 1;
    }
}
