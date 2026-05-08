## 8. Database Design

### 8.1 数据库通用约定

- 主键统一使用 `BIGSERIAL`。
- 时间字段统一使用 `TIMESTAMPTZ`。
- 软删除字段使用 `deleted_at`。
- 多语言字段优先使用独立 translation 表；页面 block 和按钮短文案可使用 JSONB。
- 动态配置字段使用 `JSONB`，并为常用查询字段增加表达式索引或 GIN 索引。
- 所有后台写操作写入 `audit_log`。
- Flyway migration 文件命名：`V001__init_users.sql`。

启用扩展：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 8.2 sys_user

用途：后台用户账号，支持运营、销售、SEO、美工、管理员。

JSONB：`profile_config` 保存头像、语言偏好、通知偏好等非核心配置。

关系：通过 `sys_user_role` 关联角色；sales lead 可分配给 sys_user。

```sql
CREATE TABLE sys_user (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(128) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(128) NOT NULL,
  phone VARCHAR(32),
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  profile_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### 8.3 sys_role

用途：后台角色，例如 ADMIN、OPERATOR、SALES、SEO、DESIGNER、BOSS。

JSONB：`data_scope_config` 保存数据范围配置。

关系：通过 `sys_user_role` 关联用户，通过 `sys_role_permission` 关联权限。

```sql
CREATE TABLE sys_role (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  data_scope_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### 8.4 sys_permission

用途：后台菜单和 API 权限点。

JSONB：不使用。

关系：通过 `sys_role_permission` 关联角色。

```sql
CREATE TABLE sys_permission (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(128) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  resource_type VARCHAR(32) NOT NULL,
  resource_path VARCHAR(255),
  action VARCHAR(64),
  parent_id BIGINT REFERENCES sys_permission(id),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
```

### 8.5 vehicle_category

用途：车型分类树，后台可动态配置。

JSONB：`seo_config` 保存 SEO 默认值；`display_config` 保存图标、封面、前台展示设置。

关系：父子分类自关联；产品属于一个分类；参数定义绑定分类。

```sql
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### 8.6 vehicle_attribute_definition

用途：车型参数模板定义。

JSONB：`options` 保存 select 选项；`validation_rules` 保存 min、max、regex；`ui_config` 保存表单显示规则。

关系：属于 vehicle_category；产品 specs 根据该表校验。

```sql
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, code)
);
```

### 8.7 product

用途：产品主表，保存分类、SKU、状态、动态 specs 和基础 SEO。

JSONB：`specs` 保存参数值；`seo_config` 保存默认 SEO；`shipping_config` 保存出口相关默认配置。

关系：属于 category；关联 translations、media、lead。

```sql
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
  published_at TIMESTAMPTZ,
  created_by BIGINT REFERENCES sys_user(id),
  updated_by BIGINT REFERENCES sys_user(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_product_specs_gin ON product USING GIN (specs);
```

### 8.8 product_translation

用途：产品多语言内容。

JSONB：`localized_specs` 保存参数标签或多语言参数值补充。

关系：属于 product。

```sql
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, locale)
);
```

### 8.9 media_asset

用途：保存图片、视频、PDF 的对象存储元数据。

JSONB：`metadata` 保存宽高、时长、页数、hash、EXIF、转码信息。

关系：可绑定产品、页面、案例、知识库文档。

```sql
CREATE TABLE media_asset (
  id BIGSERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  media_type VARCHAR(32) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  size_bytes BIGINT NOT NULL,
  object_key VARCHAR(512) NOT NULL UNIQUE,
  public_url VARCHAR(1024),
  thumbnail_url VARCHAR(1024),
  alt_text VARCHAR(255),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  uploaded_by BIGINT REFERENCES sys_user(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### 8.10 product_media

用途：产品和媒体资源的绑定关系。

JSONB：`display_config` 保存排序、裁剪、展示位置。

关系：关联 product 和 media_asset。

```sql
CREATE TABLE product_media (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  media_asset_id BIGINT NOT NULL REFERENCES media_asset(id),
  usage_type VARCHAR(32) NOT NULL,
  display_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, media_asset_id, usage_type)
);
```

### 8.11 site_page

用途：页面主表，支持首页、分类页、国家页、解决方案页、自定义页。

JSONB：`seo_config`、`page_config` 保存 SEO 和页面级配置。

关系：拥有多个 site_page_block。

```sql
CREATE TABLE site_page (
  id BIGSERIAL PRIMARY KEY,
  page_type VARCHAR(64) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  locale VARCHAR(16) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_by BIGINT REFERENCES sys_user(id),
  updated_by BIGINT REFERENCES sys_user(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (slug, locale)
);
```

### 8.12 site_page_block

用途：页面模块配置。

JSONB：`content_config` 保存标题、副标题、绑定产品、分类、案例；`style_config` 保存布局样式。

关系：属于 site_page；可引用按钮配置。

```sql
CREATE TABLE site_page_block (
  id BIGSERIAL PRIMARY KEY,
  page_id BIGINT NOT NULL REFERENCES site_page(id) ON DELETE CASCADE,
  block_key VARCHAR(128) NOT NULL,
  block_type VARCHAR(64) NOT NULL,
  locale VARCHAR(16) NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  content_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  style_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, block_key, locale)
);
```

### 8.13 site_button_config

用途：页面、产品、区块中的按钮配置。

JSONB：`action_config` 保存 WhatsApp、RFQ、download 等行为参数；`style_config` 保存视觉配置。

关系：可被 page block、产品详情或全局位置引用。

```sql
CREATE TABLE site_button_config (
  id BIGSERIAL PRIMARY KEY,
  button_key VARCHAR(128) NOT NULL,
  placement VARCHAR(128) NOT NULL,
  locale VARCHAR(16) NOT NULL,
  text VARCHAR(128) NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  style_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (button_key, placement, locale)
);
```

### 8.14 sales_lead

用途：前台 RFQ 和 AI 创建的销售线索。

JSONB：`requirement_details` 保存容量、底盘、用途、预算、参考图片等动态需求；`source_context` 保存来源页面、产品、UTM。

关系：可关联感兴趣产品、负责人 sys_user、跟进记录。

```sql
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### 8.15 sales_follow_up

用途：销售跟进记录。

JSONB：`attachments` 保存报价单、图片、邮件附件元数据。

关系：属于 sales_lead，创建人是 sys_user。

```sql
CREATE TABLE sales_follow_up (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NOT NULL REFERENCES sales_lead(id) ON DELETE CASCADE,
  follow_type VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  next_action_at TIMESTAMPTZ,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by BIGINT REFERENCES sys_user(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.16 content_article

用途：博客、采购指南、出口指南、解决方案文章。

JSONB：`seo_config`、`content_blocks` 保存 SEO 和富内容块。

关系：可进入 AI 知识库。

```sql
CREATE TABLE content_article (
  id BIGSERIAL PRIMARY KEY,
  article_type VARCHAR(64) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  locale VARCHAR(16) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  body TEXT,
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  ai_enabled BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  created_by BIGINT REFERENCES sys_user(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);
```

### 8.17 faq_item

用途：FAQ 内容，支持前台展示和 AI 问答。

JSONB：`tags`、`seo_config`。

关系：可按分类、国家、产品关联。

```sql
CREATE TABLE faq_item (
  id BIGSERIAL PRIMARY KEY,
  locale VARCHAR(16) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_code VARCHAR(64),
  related_product_id BIGINT REFERENCES product(id),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.18 export_case

用途：成功案例和出口国家背书。

JSONB：`case_details` 保存车辆数量、底盘、港口、客户行业、交付结果；`seo_config`。

关系：可关联产品、媒体、国家页。

```sql
CREATE TABLE export_case (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(160) NOT NULL,
  locale VARCHAR(16) NOT NULL,
  title VARCHAR(255) NOT NULL,
  country VARCHAR(128) NOT NULL,
  related_product_id BIGINT REFERENCES product(id),
  summary TEXT,
  body TEXT,
  case_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);
```

### 8.19 ai_chat_session

用途：AI 聊天会话。

JSONB：`client_context` 保存 locale、country、source page、utm、browser info。

关系：拥有多条 ai_chat_message；可关联 sales_lead。

```sql
CREATE TABLE ai_chat_session (
  id BIGSERIAL PRIMARY KEY,
  session_key VARCHAR(128) NOT NULL UNIQUE,
  locale VARCHAR(16),
  country VARCHAR(128),
  source_page VARCHAR(512),
  lead_id BIGINT REFERENCES sales_lead(id),
  client_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.20 ai_chat_message

用途：AI 聊天消息和工具调用记录。

JSONB：`tool_calls` 保存工具调用；`retrieval_context` 保存 RAG 命中文档。

关系：属于 ai_chat_session。

```sql
CREATE TABLE ai_chat_message (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES ai_chat_session(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(16),
  tool_calls JSONB NOT NULL DEFAULT '[]'::jsonb,
  retrieval_context JSONB NOT NULL DEFAULT '[]'::jsonb,
  safety_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.21 ai_knowledge_document

用途：AI 知识库文档元数据，包括产品、FAQ、文章、案例、PDF 手册。

JSONB：`source_metadata` 保存来源实体、媒体、语言、版本、索引参数。

关系：可关联 media_asset；拥有多个 chunk。

```sql
CREATE TABLE ai_knowledge_document (
  id BIGSERIAL PRIMARY KEY,
  source_type VARCHAR(64) NOT NULL,
  source_id BIGINT,
  media_asset_id BIGINT REFERENCES media_asset(id),
  locale VARCHAR(16) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_hash VARCHAR(128),
  index_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_knowledge_chunk (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES ai_knowledge_document(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);
```

### 8.22 audit_log

用途：记录后台关键操作。

JSONB：`before_data`、`after_data`、`request_context`。

关系：关联操作者 sys_user。

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES sys_user(id),
  action VARCHAR(128) NOT NULL,
  entity_type VARCHAR(128) NOT NULL,
  entity_id BIGINT,
  before_data JSONB,
  after_data JSONB,
  request_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

