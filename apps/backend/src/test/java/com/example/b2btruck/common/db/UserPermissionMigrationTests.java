package com.example.b2btruck.common.db;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class UserPermissionMigrationTests {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("b2btruck")
            .withUsername("b2btruck")
            .withPassword("b2btruck");

    @Test
    void flywayCreatesUserRolePermissionTablesInPostgres() {
        DataSource dataSource = DataSourceBuilder.create()
                .url(POSTGRES.getJdbcUrl())
                .username(POSTGRES.getUsername())
                .password(POSTGRES.getPassword())
                .driverClassName(POSTGRES.getDriverClassName())
                .build();

        Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .table("schema_version")
                .load()
                .migrate();

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        assertThat(tableExists(jdbcTemplate, "sys_user")).isTrue();
        assertThat(tableExists(jdbcTemplate, "sys_role")).isTrue();
        assertThat(tableExists(jdbcTemplate, "sys_permission")).isTrue();
        assertThat(tableExists(jdbcTemplate, "sys_user_role")).isTrue();
        assertThat(tableExists(jdbcTemplate, "sys_role_permission")).isTrue();
        assertThat(columnType(jdbcTemplate, "sys_user", "profile_config")).isEqualTo("jsonb");
        assertThat(columnType(jdbcTemplate, "sys_role", "data_scope_config")).isEqualTo("jsonb");
    }

    private boolean tableExists(JdbcTemplate jdbcTemplate, String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        select count(*)
                        from information_schema.tables
                        where table_schema = 'public' and table_name = ?
                        """,
                Integer.class,
                tableName
        );

        return count != null && count == 1;
    }

    private String columnType(JdbcTemplate jdbcTemplate, String tableName, String columnName) {
        return jdbcTemplate.queryForObject(
                """
                        select udt_name
                        from information_schema.columns
                        where table_schema = 'public' and table_name = ? and column_name = ?
                        """,
                String.class,
                tableName,
                columnName
        );
    }
}
