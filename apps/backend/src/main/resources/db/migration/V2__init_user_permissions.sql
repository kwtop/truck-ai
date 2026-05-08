CREATE TABLE sys_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(128) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    profile_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sys_role (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    data_scope_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sys_permission (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    resource_type VARCHAR(32) NOT NULL,
    resource_path VARCHAR(255),
    action VARCHAR(64),
    parent_id BIGINT REFERENCES sys_permission(id),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE sys_user_role (
    user_id BIGINT NOT NULL REFERENCES sys_user(id),
    role_id BIGINT NOT NULL REFERENCES sys_role(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE sys_role_permission (
    role_id BIGINT NOT NULL REFERENCES sys_role(id),
    permission_id BIGINT NOT NULL REFERENCES sys_permission(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_sys_user_status ON sys_user(status);
CREATE INDEX idx_sys_user_deleted_at ON sys_user(deleted_at);
CREATE INDEX idx_sys_role_status ON sys_role(status);
CREATE INDEX idx_sys_permission_parent_id ON sys_permission(parent_id);
