CREATE TABLE sales_lead (
    id BIGSERIAL PRIMARY KEY,
    lead_no VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    company_name VARCHAR(160),
    country VARCHAR(128),
    email VARCHAR(160),
    whatsapp VARCHAR(64),
    interested_product_id BIGINT REFERENCES product(id),
    vehicle_type VARCHAR(128),
    quantity INT,
    message TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW',
    assigned_to BIGINT REFERENCES sys_user(id),
    quoted BOOLEAN NOT NULL DEFAULT false,
    won BOOLEAN NOT NULL DEFAULT false,
    requirement_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sales_follow_up (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES sales_lead(id) ON DELETE CASCADE,
    follow_type VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    next_action_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_lead_status ON sales_lead(status);
CREATE INDEX idx_sales_lead_country ON sales_lead(country);
CREATE INDEX idx_sales_lead_assigned_to ON sales_lead(assigned_to);
CREATE INDEX idx_sales_lead_interested_product_id ON sales_lead(interested_product_id);
CREATE INDEX idx_sales_lead_created_at ON sales_lead(created_at);
CREATE INDEX idx_sales_lead_deleted_at ON sales_lead(deleted_at);
CREATE INDEX idx_sales_follow_up_lead_id ON sales_follow_up(lead_id);
CREATE INDEX idx_sales_follow_up_follow_type ON sales_follow_up(follow_type);
CREATE INDEX idx_sales_follow_up_created_by ON sales_follow_up(created_by);
CREATE INDEX idx_sales_follow_up_created_at ON sales_follow_up(created_at);
