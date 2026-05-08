CREATE TABLE product (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES vehicle_category(id),
    sku VARCHAR(64) UNIQUE,
    slug VARCHAR(160) NOT NULL UNIQUE,
    default_name VARCHAR(160) NOT NULL,
    default_summary TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    shipping_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_enabled BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by BIGINT REFERENCES sys_user(id),
    updated_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE product_translation (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    locale VARCHAR(16) NOT NULL,
    name VARCHAR(180) NOT NULL,
    summary TEXT,
    description TEXT,
    applications TEXT,
    localized_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    canonical_url VARCHAR(512),
    og_title VARCHAR(255),
    og_description TEXT,
    og_image VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (product_id, locale)
);

CREATE INDEX idx_product_category_id ON product(category_id);
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_featured ON product(featured);
CREATE INDEX idx_product_deleted_at ON product(deleted_at);
CREATE INDEX idx_product_sort_order ON product(sort_order);
CREATE INDEX idx_product_translation_locale ON product_translation(locale);
