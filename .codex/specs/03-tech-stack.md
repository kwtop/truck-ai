## 3. Tech Stack

### 3.1 技术栈总览

| 层级 | 技术 | 用途 | 选择原因 |
|------|------|------|----------|
| 后端语言 | Java 17 | 业务 API、CMS、CRM、AI 编排 | LTS、环境兼容性好、生态成熟。 |
| 后端框架 | Spring Boot 3.x | 模块化单体应用 | 适合企业级后台和 REST API。 |
| 安全 | Spring Security + JWT | 后台认证和权限控制 | 标准方案，易测试，易扩展。 |
| ORM | MyBatis-Plus | CRUD、分页、条件查询 | 与后台 CRUD 需求匹配，SQL 可控。 |
| 数据库 | PostgreSQL | 核心业务数据 | 关系型强、JSONB 和 pgvector 支持好。 |
| 动态配置 | PostgreSQL JSONB | specs、block config、button config | 支持灵活结构和 GIN 索引。 |
| 向量存储 | PostgreSQL + pgvector | AI RAG 检索 | 首版减少组件复杂度。 |
| 缓存 | Redis | 页面缓存、限流、验证码、AI 会话状态 | 高性能、部署简单。 |
| 对象存储 | MinIO / S3-compatible | 图片、视频、PDF | 本地开发和生产 S3 可兼容。 |
| AI 编排 | Spring AI / 自定义 LLM Provider | 聊天、RAG、工具调用 | 支持切换不同模型提供商。 |
| 数据迁移 | Flyway | 数据库版本管理 | 可审计、可回滚、适合自动化开发。 |
| DTO 映射 | MapStruct | Entity/DTO 转换 | 编译期生成，减少手写重复代码。 |
| 样板简化 | Lombok | Getter、Builder、构造器 | 减少样板代码。 |
| API 文档 | Springdoc OpenAPI | Swagger UI 和接口契约 | 便于前后端联调。 |
| 后端测试 | JUnit 5 + Mockito + Testcontainers | 单元和集成测试 | 可验证 PostgreSQL、Redis、MinIO。 |
| 前台 | Next.js + TypeScript + Tailwind CSS | SEO 独立站 | SSR/SSG、metadata、路由和样式效率高。 |
| 前台国际化 | next-intl | locale 路由和翻译 | 与 Next.js App Router 兼容。 |
| 前台表单 | React Hook Form + Zod | RFQ 表单和校验 | 类型安全、易测试。 |
| 后台 | React + Vite + TypeScript | 管理端 SPA | 构建快、开发体验好。 |
| 后台 UI | Ant Design | 表格、表单、弹窗、上传 | 企业后台成熟组件。 |
| 后台数据 | TanStack Query | API 缓存、刷新、状态 | CRUD 页面效率高。 |
| 后台状态 | Zustand | 用户、权限、UI 状态 | 轻量，适合后台。 |
| 前端测试 | Vitest + Playwright | 组件和 E2E | 覆盖 UI 与核心流程。 |
| 部署 | Docker Compose + Nginx | 首版部署 | 低复杂度，便于交付。 |

### 3.2 后端技术栈

后端采用模块化单体架构，一个 Spring Boot 应用内划分清晰业务模块：

```text
Java 17
Spring Boot 3.x
Spring Security
JWT
MyBatis-Plus
PostgreSQL
PostgreSQL JSONB
pgvector
Redis
MinIO
Spring AI / custom LLM Provider
Flyway
MapStruct
Lombok
Springdoc OpenAPI
JUnit 5
Mockito
Testcontainers
Docker Compose
```

首版不做微服务，原因：

- 业务还处于独立站首版阶段，模块化单体交付速度更快。
- 后台 CMS、CRM、AI 管理共享用户权限和数据模型，拆分微服务会增加事务和联调成本。
- 模块边界清晰后，后续可按 `ai`、`lead`、`media` 等模块拆分。

### 3.3 前台技术栈

前台使用：

```text
Next.js
TypeScript
Tailwind CSS
next-intl
React Hook Form
Zod
```

选择原因：

- 独立站需要 SEO，Next.js 支持 SSR、SSG、metadata、sitemap。
- 产品页、分类页、国家落地页、博客页需要被 Google 收录。
- App Router 适合多语言路由。
- Tailwind CSS 适合快速构建营销型和产品型页面。
- Zod + React Hook Form 让 RFQ 表单校验可复用。

### 3.4 后台技术栈

后台使用：

```text
React
Vite
TypeScript
Ant Design
TanStack Query
Zustand
React Hook Form
Zod
```

选择原因：

- 后台以表格、筛选、表单、上传、弹窗、权限菜单为主。
- Ant Design 覆盖企业后台常见组件。
- TanStack Query 适合统一处理列表分页、详情、创建、更新、失效刷新。
- Zustand 管理登录用户、权限、折叠菜单和全局 UI 状态。

### 3.5 数据存储方案

业务数据：

- PostgreSQL 保存产品、分类、参数模板、页面配置、按钮配置、多语言内容、SEO、询盘、客户、跟进、AI 聊天、知识库元数据。

动态配置：

- PostgreSQL JSONB 保存产品 specs、页面 block config、按钮 action config、样式配置、参数 options、AI 工具配置。

文件：

- MinIO / S3-compatible Object Storage 保存图片、视频、PDF。
- 数据库只保存 `file_name`、`media_type`、`mime_type`、`size_bytes`、`object_key`、`public_url`、`thumbnail_url`、`uploaded_by`、`created_at`。

AI 向量：

- pgvector 保存知识库 chunk embedding。
- 文档元数据和索引状态存储在 PostgreSQL。

缓存：

- Redis 用于首页缓存、产品缓存、分类缓存、验证码、限流、临时会话和 AI 会话状态。

### 3.6 部署方案

首版 Docker Compose 服务：

- `backend`：Spring Boot API。
- `web`：Next.js 前台。
- `admin`：React Vite 后台静态资源。
- `postgres`：PostgreSQL + pgvector。
- `redis`：缓存。
- `minio`：对象存储。
- `nginx`：统一入口、反向代理、静态资源缓存。

后续可扩展：

- Kubernetes。
- CDN。
- 对象存储切换云厂商 S3。
- 独立 AI worker。
- 独立搜索服务。

