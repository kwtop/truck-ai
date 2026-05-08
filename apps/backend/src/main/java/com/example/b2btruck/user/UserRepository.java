package com.example.b2btruck.user;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<UserAccount> findByUsername(String username) {
        List<UserAccount> users = jdbcTemplate.query(
                """
                        select id, username, password_hash, display_name, status
                        from sys_user
                        where username = ? and deleted_at is null
                        """,
                this::mapUser,
                username
        );

        return users.stream().findFirst();
    }

    public List<String> findPermissionCodes(Long userId) {
        return jdbcTemplate.queryForList(
                """
                        select distinct p.code
                        from sys_user_role ur
                        join sys_role_permission rp on rp.role_id = ur.role_id
                        join sys_permission p on p.id = rp.permission_id
                        join sys_role r on r.id = ur.role_id
                        where ur.user_id = ?
                          and r.deleted_at is null
                          and r.status = 'ACTIVE'
                        order by p.code
                        """,
                String.class,
                userId
        );
    }

    public void markLastLogin(Long userId) {
        jdbcTemplate.update(
                "update sys_user set last_login_at = now(), updated_at = now() where id = ?",
                userId
        );
    }

    private UserAccount mapUser(ResultSet resultSet, int rowNum) throws SQLException {
        return new UserAccount(
                resultSet.getLong("id"),
                resultSet.getString("username"),
                resultSet.getString("password_hash"),
                resultSet.getString("display_name"),
                resultSet.getString("status")
        );
    }
}
