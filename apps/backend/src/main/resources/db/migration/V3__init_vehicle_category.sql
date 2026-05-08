CREATE TABLE vehicle_category (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES vehicle_category(id),
    code VARCHAR(64) NOT NULL UNIQUE,
    slug VARCHAR(128) NOT NULL UNIQUE,
    default_name VARCHAR(128) NOT NULL,
    default_description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    sort_order INT NOT NULL DEFAULT 0,
    seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by BIGINT REFERENCES sys_user(id),
    updated_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_vehicle_category_parent_id ON vehicle_category(parent_id);
CREATE INDEX idx_vehicle_category_status ON vehicle_category(status);
CREATE INDEX idx_vehicle_category_deleted_at ON vehicle_category(deleted_at);
CREATE INDEX idx_vehicle_category_sort_order ON vehicle_category(sort_order);
