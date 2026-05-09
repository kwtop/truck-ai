package com.example.b2btruck.lead;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
class LeadMigrationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from sales_follow_up");
        jdbcTemplate.update("delete from sales_lead");
        jdbcTemplate.update("delete from product_translation");
        jdbcTemplate.update("delete from product_media");
        jdbcTemplate.update("delete from product");
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
        jdbcTemplate.update("delete from sys_user_role");
        jdbcTemplate.update("delete from sys_user");
    }

    @Test
    void createsLeadAndFollowUpTablesWithKeyColumns() {
        assertThat(tableExists("sales_lead")).isTrue();
        assertThat(tableExists("sales_follow_up")).isTrue();
        assertThat(columnExists("sales_lead", "lead_no")).isTrue();
        assertThat(columnExists("sales_lead", "interested_product_id")).isTrue();
        assertThat(columnExists("sales_lead", "assigned_to")).isTrue();
        assertThat(columnExists("sales_lead", "requirement_details")).isTrue();
        assertThat(columnExists("sales_lead", "source_context")).isTrue();
        assertThat(columnExists("sales_follow_up", "lead_id")).isTrue();
        assertThat(columnExists("sales_follow_up", "attachments")).isTrue();
        assertThat(columnExists("sales_follow_up", "next_action_at")).isTrue();
    }

    @Test
    void insertsLeadAndFollowUpWithJsonFields() {
        Long userId = createUser("sales-owner");
        Long productId = createProduct(createCategory(), "SKU-LEAD-10000L", "lead-fuel-tank-truck-10000l");
        Long leadId = createLead("LEAD-20260509-0001", productId, userId);
        Long followUpId = createFollowUp(leadId, userId);

        Integer followUps = jdbcTemplate.queryForObject(
                """
                        select count(*)
                        from sales_follow_up
                        where id = ?
                          and lead_id = ?
                          and attachments is not null
                        """,
                Integer.class,
                followUpId,
                leadId
        );
        assertThat(followUps).isOne();
    }

    @Test
    void appliesLeadAndFollowUpDefaults() {
        Long leadId = createLeadWithDefaults("LEAD-20260509-0002");
        Long followUpId = createFollowUpWithDefaults(leadId);

        var leadDefaults = jdbcTemplate.queryForMap(
                """
                        select status,
                               quoted,
                               won,
                               requirement_details::text as requirement_details,
                               source_context::text as source_context
                        from sales_lead
                        where id = ?
                        """,
                leadId
        );
        var followUpDefaults = jdbcTemplate.queryForMap(
                "select attachments::text as attachments from sales_follow_up where id = ?",
                followUpId
        );

        assertThat(leadDefaults.get("status")).isEqualTo("NEW");
        assertThat(leadDefaults.get("quoted")).isEqualTo(false);
        assertThat(leadDefaults.get("won")).isEqualTo(false);
        assertThat(leadDefaults.get("requirement_details").toString()).contains("{}");
        assertThat(leadDefaults.get("source_context").toString()).contains("{}");
        assertThat(followUpDefaults.get("attachments").toString()).contains("[]");
    }

    @Test
    void enforcesUniqueLeadNo() {
        createLeadWithDefaults("LEAD-20260509-0003");

        assertThatThrownBy(() -> createLeadWithDefaults("LEAD-20260509-0003"))
                .isInstanceOf(DuplicateKeyException.class);
    }

    @Test
    void deletesFollowUpsWhenLeadIsDeleted() {
        Long leadId = createLeadWithDefaults("LEAD-20260509-0004");
        createFollowUpWithDefaults(leadId);

        jdbcTemplate.update("delete from sales_lead where id = ?", leadId);

        Integer followUps = jdbcTemplate.queryForObject(
                "select count(*) from sales_follow_up where lead_id = ?",
                Integer.class,
                leadId
        );
        assertThat(followUps).isZero();
    }

    private Long createUser(String username) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into sys_user (
                                        username,
                                        email,
                                        password_hash,
                                        display_name,
                                        profile_config
                                    )
                                    values (?, ?, '{noop}password', 'Sales Owner', '{}'::jsonb)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setString(1, username);
                    statement.setString(2, username + "@example.com");
                    return statement;
                },
                keyHolder
        );
        return keyHolder.getKey().longValue();
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
                                    values ('LEAD_FUEL_TANK_TRUCK', 'lead-fuel-tank-truck', 'Fuel Tank Truck', 'ACTIVE', '{}'::jsonb, '{}'::jsonb)
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
                                    values (?, ?, ?, '10,000L Fuel Tank Truck', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setLong(1, categoryId);
                    statement.setString(2, sku);
                    statement.setString(3, slug);
                    return statement;
                },
                keyHolder
        );
        return keyHolder.getKey().longValue();
    }

    private Long createLead(String leadNo, Long productId, Long assignedTo) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into sales_lead (
                                        lead_no,
                                        name,
                                        company_name,
                                        country,
                                        email,
                                        whatsapp,
                                        interested_product_id,
                                        vehicle_type,
                                        quantity,
                                        message,
                                        status,
                                        assigned_to,
                                        requirement_details,
                                        source_context,
                                        ai_summary
                                    )
                                    values (?, 'Maria Lopez', 'North Cargo SA', 'Mexico', 'maria@example.com', '+52 55 0000 0000', ?, 'Fuel Tank Truck', 2, 'Need CIF Manzanillo quote.', 'NEW', ?, ?::jsonb, ?::jsonb, 'Buyer needs export-ready fuel trucks.')
                                    """,
                            new String[]{"id"}
                    );
                    statement.setString(1, leadNo);
                    statement.setLong(2, productId);
                    statement.setLong(3, assignedTo);
                    statement.setString(4, "{\"capacityLiters\":10000,\"budget\":\"open\"}");
                    statement.setString(5, "{\"sourcePage\":\"/en-US/contact\",\"utmCampaign\":\"rfq\"}");
                    return statement;
                },
                keyHolder
        );
        return keyHolder.getKey().longValue();
    }

    private Long createLeadWithDefaults(String leadNo) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into sales_lead (
                                        lead_no,
                                        name,
                                        email
                                    )
                                    values (?, 'Default Buyer', 'buyer@example.com')
                                    """,
                            new String[]{"id"}
                    );
                    statement.setString(1, leadNo);
                    return statement;
                },
                keyHolder
        );
        return keyHolder.getKey().longValue();
    }

    private Long createFollowUp(Long leadId, Long createdBy) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into sales_follow_up (
                                        lead_id,
                                        follow_type,
                                        content,
                                        next_action_at,
                                        attachments,
                                        created_by
                                    )
                                    values (?, 'EMAIL', 'Sent catalog and requested chassis preference.', ?, ?::jsonb, ?)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setLong(1, leadId);
                    statement.setTimestamp(2, Timestamp.from(Instant.now().plus(2, ChronoUnit.DAYS)));
                    statement.setString(3, "[{\"fileName\":\"catalog.pdf\",\"url\":\"https://cdn.example.com/catalog.pdf\"}]");
                    statement.setLong(4, createdBy);
                    return statement;
                },
                keyHolder
        );
        return keyHolder.getKey().longValue();
    }

    private Long createFollowUpWithDefaults(Long leadId) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into sales_follow_up (
                                        lead_id,
                                        follow_type,
                                        content
                                    )
                                    values (?, 'CALL', 'Called buyer and confirmed destination port.')
                                    """,
                            new String[]{"id"}
                    );
                    statement.setLong(1, leadId);
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
