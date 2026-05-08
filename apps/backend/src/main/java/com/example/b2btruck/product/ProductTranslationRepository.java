package com.example.b2btruck.product;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ProductTranslationRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProductTranslationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ProductTranslation> findByProductId(Long productId) {
        return jdbcTemplate.query(
                """
                        select *
                        from product_translation
                        where product_id = ?
                        order by locale
                        """,
                this::mapTranslation,
                productId
        );
    }

    public Optional<ProductTranslation> findByProductIdAndLocale(Long productId, String locale) {
        List<ProductTranslation> translations = jdbcTemplate.query(
                """
                        select *
                        from product_translation
                        where product_id = ? and locale = ?
                        """,
                this::mapTranslation,
                productId,
                locale
        );
        return translations.stream().findFirst();
    }

    public ProductTranslation upsert(UpsertProductTranslationCommand command) {
        jdbcTemplate.update(
                """
                        insert into product_translation (
                            product_id,
                            locale,
                            name,
                            summary,
                            description,
                            applications,
                            localized_specs,
                            seo_title,
                            seo_description,
                            seo_keywords,
                            canonical_url,
                            og_title,
                            og_description,
                            og_image
                        )
                        values (?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, ?, ?, ?)
                        on conflict (product_id, locale)
                        do update set
                            name = excluded.name,
                            summary = excluded.summary,
                            description = excluded.description,
                            applications = excluded.applications,
                            localized_specs = excluded.localized_specs,
                            seo_title = excluded.seo_title,
                            seo_description = excluded.seo_description,
                            seo_keywords = excluded.seo_keywords,
                            canonical_url = excluded.canonical_url,
                            og_title = excluded.og_title,
                            og_description = excluded.og_description,
                            og_image = excluded.og_image,
                            updated_at = now()
                        """,
                command.productId(),
                command.locale(),
                command.name(),
                command.summary(),
                command.description(),
                command.applications(),
                defaultJson(command.localizedSpecs()),
                command.seoTitle(),
                command.seoDescription(),
                command.seoKeywords(),
                command.canonicalUrl(),
                command.ogTitle(),
                command.ogDescription(),
                command.ogImage()
        );

        return findByProductIdAndLocale(command.productId(), command.locale()).orElseThrow();
    }

    private ProductTranslation mapTranslation(ResultSet resultSet, int rowNum) throws SQLException {
        return new ProductTranslation(
                resultSet.getLong("id"),
                resultSet.getLong("product_id"),
                resultSet.getString("locale"),
                resultSet.getString("name"),
                resultSet.getString("summary"),
                resultSet.getString("description"),
                resultSet.getString("applications"),
                resultSet.getString("localized_specs"),
                resultSet.getString("seo_title"),
                resultSet.getString("seo_description"),
                resultSet.getString("seo_keywords"),
                resultSet.getString("canonical_url"),
                resultSet.getString("og_title"),
                resultSet.getString("og_description"),
                resultSet.getString("og_image"),
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
