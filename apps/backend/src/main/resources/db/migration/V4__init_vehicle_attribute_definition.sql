CREATE TABLE vehicle_attribute_definition (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES vehicle_category(id),
    code VARCHAR(64) NOT NULL,
    default_label VARCHAR(128) NOT NULL,
    data_type VARCHAR(32) NOT NULL,
    unit VARCHAR(32),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    ui_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    required BOOLEAN NOT NULL DEFAULT false,
    filterable BOOLEAN NOT NULL DEFAULT false,
    comparable BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (category_id, code)
);

CREATE INDEX idx_vehicle_attribute_definition_category_id ON vehicle_attribute_definition(category_id);
CREATE INDEX idx_vehicle_attribute_definition_status ON vehicle_attribute_definition(status);
CREATE INDEX idx_vehicle_attribute_definition_sort_order ON vehicle_attribute_definition(sort_order);
