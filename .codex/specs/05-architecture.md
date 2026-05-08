## 5. Architecture

### 5.1 整体架构图

```text
                    Overseas Visitors
                           |
                           v
                 +-------------------+
                 |   Nginx Gateway   |
                 +-------------------+
                  |        |        |
                  v        v        v
          +----------+ +--------+ +----------------+
          | Next.js  | | Admin  | | Static / Media |
          | Web Site | | React  | | Reverse Proxy  |
          +----------+ +--------+ +----------------+
                  |        |
                  +--------+----------------+
                                           v
                              +-------------------------+
                              | Spring Boot Backend API |
                              | Modular Monolith        |
                              +-------------------------+
                               |     |       |       |
                               v     v       v       v
                         PostgreSQL Redis  MinIO   LLM Provider
                         JSONB +    Cache  /S3    Spring AI /
                         pgvector                 Custom Adapter
```

### 5.2 前台架构

前台目录以 locale 路由为核心：

```text
apps/web
  src/app/[locale]/
    page.tsx
    products/
    categories/
    markets/
    solutions/
    cases/
    blogs/
    faq/
    about/
    contact/
  src/components/
    layout/
    product/
    category/
    market/
    solution/
    lead/
    ai/
    page-blocks/
  src/lib/
    api/
    seo/
    i18n/
    validation/
```

前台模块：

| 模块 | 职责 |
|------|------|
| `layout` | Header、Footer、语言切换、WhatsApp 浮动按钮、全局 CTA。 |
| `product` | 产品列表、产品卡片、产品详情、参数表、PDF 下载。 |
| `category` | 分类页、参数筛选、分类 SEO 文案。 |
| `market` | 国家落地页、出口流程、国家案例。 |
| `solution` | 应用场景和解决方案页。 |
| `lead` | RFQ 表单、表单弹窗、来源追踪。 |
| `ai` | AI 聊天窗口、消息流、工具结果卡片。 |
| `page-blocks` | 根据 block_type 渲染 Hero、FAQ、Case、CTA 等模块。 |

### 5.3 后台架构

后台为 Vite + React SPA：

```text
apps/admin
  src/
    app/
    routes/
    components/
    features/
      dashboard/
      auth/
      product/
      category/
      attribute/
      media/
      page/
      button/
      lead/
      content/
      ai/
      system/
    lib/
      api/
      auth/
      validation/
      permissions/
```

后台模块：

| 模块 | 职责 |
|------|------|
| `dashboard` | 询盘趋势、热门产品、线索状态、AI 高频问题。 |
| `product` | 产品 CRUD、多语言、动态参数、发布状态。 |
| `category` | 车型分类树、slug、SEO、排序。 |
| `attribute` | 分类参数模板、字段类型、选项、校验规则。 |
| `media` | 图片、视频、PDF 上传、列表、预览、绑定。 |
| `page` | 页面管理、页面区块排序、区块配置。 |
| `button` | 按钮文本、位置、行为、样式配置。 |
| `lead` | 询盘列表、详情、分配、状态、跟进、导出。 |
| `content` | 博客、FAQ、案例、出口指南、多语言内容。 |
| `ai` | 知识库文档、索引状态、聊天记录、工具配置。 |
| `system` | 用户、角色、权限、系统设置。 |

### 5.4 后端模块架构

```text
apps/backend/src/main/java/com/example/b2btruck
  common/
  auth/
  user/
  category/
  attribute/
  product/
  media/
  page/
  button/
  content/
  seo/
  lead/
  ai/
  audit/
  config/
```

| 模块 | 职责 |
|------|------|
| `common` | 通用响应、异常、分页、枚举、工具类。 |
| `user` | 用户、角色、权限、后台账号。 |
| `auth` | 登录、JWT、认证过滤器、权限上下文。 |
| `category` | 车型分类树、slug、状态、SEO 基础信息。 |
| `attribute` | 车型参数模板、动态字段校验。 |
| `product` | 产品主数据、多语言、规格、媒体绑定、发布状态。 |
| `media` | MinIO 上传、文件元数据、文件安全校验。 |
| `page` | 页面、页面区块、block config。 |
| `button` | 按钮配置、action config、位置和样式。 |
| `content` | 博客、FAQ、成功案例、出口指南。 |
| `seo` | sitemap、robots、metadata、hreflang、结构化数据。 |
| `lead` | RFQ、销售线索、分配、状态、跟进、导出。 |
| `ai` | 聊天、RAG、工具调用、知识库、聊天记录。 |
| `audit` | 审计日志、关键写操作追踪。 |

### 5.5 数据存储架构

```text
PostgreSQL
  relational tables:
    users, roles, products, leads, pages, articles
  JSONB:
    product specs, block config, button action config, style config
  pgvector:
    AI knowledge chunks embedding

MinIO / S3
  product images
  product videos
  PDF brochures
  case media

Redis
  page cache
  product/category cache
  rate limit
  captcha
  temporary AI session state
```

### 5.6 AI 助手架构

```text
User Message
   |
   v
Language Detection
   |
   v
Intent Classification
   |
   +--> Tool Calling: search_products / get_product_detail / create_sales_lead
   |
   +--> RAG Retrieval: pgvector knowledge chunks
   |
   v
Guardrails: no fake price, no fake stock, no false certification
   |
   v
Localized Answer + RFQ CTA
   |
   v
Store ai_chat_message and optional sales_lead
```

### 5.7 完整目录结构树

```text
b2c-shop/
  AGENTS.md
  DEV_SPEC.md
  README.md
  docker-compose.yml
  .env.example
  apps/
    backend/
      pom.xml
      src/main/java/com/example/b2btruck/
      src/main/resources/
        application.yml
        db/migration/
      src/test/java/com/example/b2btruck/
    web/
      package.json
      next.config.ts
      src/app/[locale]/
      src/components/
      src/lib/
      messages/
    admin/
      package.json
      vite.config.ts
      src/features/
      src/components/
      src/lib/
  packages/
    shared-types/
  infra/
    nginx/
    minio/
    postgres/
  tests/
    e2e/
  docs/
    api.md
    setup.md
    architecture.md
```

