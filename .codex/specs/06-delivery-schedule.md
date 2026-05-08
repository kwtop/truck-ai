## 6. Delivery Schedule

状态标记：

| Marker | Meaning |
|--------|---------|
| `[ ]` | 未开始 |
| `[~]` | 进行中 |
| `[x]` | 已完成 |

任务粒度原则：

- 每个任务约 1 小时可验收。
- 每个任务必须能通过命令、接口、UI 或生成文件验证。
- 表格前四列固定供自动化脚本解析，后续列给实现者提供详细上下文。

| ID | Task | Status | Acceptance Notes | Main Files | Classes / Pages / APIs / Tables | Test Method |
|----|------|--------|------------------|------------|----------------------------------|-------------|
| A1 | 初始化仓库结构 | [x] | 已创建 apps/backend、apps/web、apps/admin、infra、tests、docs 基础目录 | root, apps, infra, docs | 无业务 API；无业务表 | `Get-ChildItem` 验证目录存在 |
| A2 | 初始化后端 Spring Boot 工程 | [x] | 已创建 Java 17 + Spring Boot 3.3.5 后端工程；`mvn test` 通过，Actuator health 返回 UP | `apps/backend/pom.xml`, `B2BTruckApplication.java` | `GET /actuator/health` | `cd apps/backend && mvn test` |
| A3 | 初始化前台 Next.js 工程 | [x] | 已创建 Next.js 16 + TypeScript + Tailwind + next-intl 前台工程；`npm run build` 通过，`/en-US` 返回 200 | `apps/web/package.json`, `src/app/[locale]/page.tsx` | `/en-US` 页面 | `cd apps/web && npm run build` |
| A4 | 初始化后台 React Vite 工程 | [x] | 已创建 Vite + React + TypeScript + Ant Design 后台工程；`npm run build` 通过，静态预览 `/login` 返回 200 | `apps/admin/package.json`, `src/routes` | `/login` 页面 | `cd apps/admin && npm run build` |
| A5 | 配置 Docker Compose 基础服务 | [x] | 已配置 PostgreSQL + pgvector、Redis、MinIO 基础服务、端口、健康检查和持久化卷；`docker compose config` 通过 | `docker-compose.yml`, `.env.example` | `postgres`, `redis`, `minio` | `docker compose config` |
| A6 | 添加 Flyway 基础迁移 | [x] | 已添加 Flyway 配置和 baseline migration；`mvn -s .mvn-temp/settings.xml test` 通过，日志确认创建 `schema_version` 并应用 v1 baseline | `apps/backend/src/main/resources/db/migration` | Flyway baseline | `mvn test` 验证 migration 加载 |
| A7 | 添加 OpenAPI 和统一响应 | [x] | 已添加 Springdoc OpenAPI、Swagger UI、`ApiResponse`、`PageResponse`、requestId 和统一 JSON 响应包装；`mvn -s .mvn-temp/settings.xml test` 通过 | `common`, `config` | `ApiResponse`, `PageResponse` | MockMvc 测试响应结构 |
| B1 | 创建用户权限数据表 | [x] | 已新增 sys_user、sys_role、sys_permission、sys_user_role、sys_role_permission 迁移；`DOCKER_HOST=npipe:////./pipe/dockerDesktopLinuxEngine mvn -s .mvn-temp/settings.xml test` 通过，Testcontainers PostgreSQL 16 实际应用 v1/v2 migrations | Flyway migration | `sys_user`, `sys_role`, `sys_permission` | Testcontainers 跑 migration |
| B2 | 实现密码登录 | [x] | 已实现用户名密码登录、BCrypt 校验、JWT 生成、权限 code 返回和失败 401；`mvn -s .mvn-temp/settings.xml -Dtest=AuthControllerIntegrationTests test` 通过 | `auth`, `user` | `POST /api/admin/auth/login` | MockMvc 登录成功/失败 |
| B3 | 实现 JWT 认证过滤器 | [x] | 已实现 Spring Security JWT 过滤器、无 token/无效 token 统一 401、有效 token 放行；`mvn -s .mvn-temp/settings.xml -Dtest=AuthControllerIntegrationTests test` 通过 | `auth/security` | `JwtAuthenticationFilter`, `SecurityConfig`, `GET /api/admin/auth/me` | Security integration test |
| B4 | 实现角色权限模型 | [x] | 已抽出 `PermissionService` 聚合角色权限，并提供接口权限断言和 403 统一响应；`mvn -s .mvn-temp/settings.xml "-Dtest=AuthControllerIntegrationTests,PermissionServiceTests" test` 通过 | `user`, `auth` | `PermissionService`, `GET /api/admin/auth/permission-check` | 单元测试权限聚合 + MockMvc 权限校验 |
| B5 | 后台登录页接入 API | [x] | 已接入 `POST /api/admin/auth/login`，登录成功保存 token/user/permissions 并跳转 `/dashboard`；`npm run test` 和 `npm run build` 通过 | `apps/admin/src/features/auth`, `apps/admin/src/stores/authStore.ts`, `apps/admin/src/routes` | `/login`, `/dashboard`, auth store | Vitest + build smoke |
| B6 | 后台权限菜单 | [x] | 已按权限过滤后台菜单，并用 route guard 阻止未授权路由；`npm run test` 和 `npm run build` 通过 | `apps/admin/src/lib/permissions`, `apps/admin/src/routes` | route guard, `/products`, `/leads` | Vitest route guard + build smoke |
| C1 | 创建车型分类表和实体 | [x] | 已新增 `vehicle_category` migration、实体和 Repository，可保存父子分类；`mvn -s .mvn-temp/settings.xml -Dtest=VehicleCategoryRepositoryTests test` 通过 | migration, `category` | `vehicle_category`, `VehicleCategoryRepository` | Repository test |
| C2 | 实现后台分类 CRUD API | [x] | 已实现后台分类树查询、新增、编辑、启停和排序，并校验 `category:read/write` 权限；`mvn -s .mvn-temp/settings.xml "-Dtest=VehicleCategoryRepositoryTests,VehicleCategoryControllerIntegrationTests" test` 通过 | `category/controller` | `GET/POST/PUT /api/admin/categories` | MockMvc CRUD |
| C3 | 实现后台分类管理页面 | [x] | 已实现后台分类树表格、新增/编辑/启停/排序入口和权限菜单接入；`npm run test`、`npm run build` 通过 | `apps/admin/src/features/category` | Category list/form | Vitest component test |
| C4 | 创建参数定义表和实体 | [x] | 已新增 `vehicle_attribute_definition` migration、实体和 Repository，可按分类维护参数定义；`mvn -s .mvn-temp/settings.xml test` 通过，25 tests、0 failures、1 skipped | migration, `attribute` | `vehicle_attribute_definition` | Repository test |
| C5 | 实现参数模板 CRUD API | [x] | 已实现 `GET/POST/PUT /api/admin/attributes`、`attribute:read/write` 权限、类型/状态/JSON 配置校验；`mvn -s .mvn-temp/settings.xml test` 通过，29 tests、0 failures、1 skipped | `attribute/controller` | `GET/POST/PUT /api/admin/attributes` | MockMvc validation |
| C6 | 后台参数模板表单 | [x] | 已实现后台参数模板页面、分类选择、属性列表、新增/编辑表单、JSON 配置校验和权限菜单接入；`npm run test`、`npm run build` 通过 | `apps/admin/src/features/attribute` | Attribute editor | Vitest 表单校验 |
| C7 | 前台公开分类 API | [x] | 已实现 `GET /api/public/categories`，无需后台 JWT，只返回 ACTIVE 分类树并输出 SEO/display JSON 字段；`mvn -s .mvn-temp/settings.xml test` 通过，31 tests、0 failures、1 skipped | `category/public` | `GET /api/public/categories` | MockMvc public API |
| D1 | 创建产品核心表 | [x] | 已新增 `product`、`product_translation` migration，并验证表结构、唯一约束和 translation 级联删除；`mvn -s .mvn-temp/settings.xml test` 通过，34 tests、0 failures、1 skipped | migration, `product` | `product`, `product_translation` | migration test |
| D2 | 实现产品 specs 校验 | [x] | 已新增 `ProductSpecValidator`，按分类参数模板校验 required、unknown fields、number/text/select/multi_select/boolean/range、options、min/max/regex；`mvn -s .mvn-temp/settings.xml test` 通过，41 tests、0 failures、1 skipped | `product/service` | `ProductSpecValidator` | 单元测试各字段类型 |
| D3 | 实现后台产品 CRUD API | [x] | 已实现后台产品列表、详情、创建草稿、更新发布和软删除，并校验 `product:read/write` 权限与动态 specs；`mvn -s .mvn-temp/settings.xml test` 通过，44 tests、0 failures、1 skipped | `product/controller` | `GET/POST/PUT/DELETE /api/admin/products` | MockMvc CRUD |
| D4 | 实现产品多语言维护 | [x] | 已实现产品翻译列表、按 locale 读取和 upsert，支持名称、描述、应用、localizedSpecs 与 SEO 字段，缺失 locale 时回退默认产品内容；`mvn -s .mvn-temp/settings.xml test` 通过，49 tests、0 failures、1 skipped | `product/translation` | `product_translation` | Service test fallback |
| D5 | 后台产品列表和编辑页 | [x] | 已实现后台产品列表、筛选、新增/编辑/删除、分类选择、按属性模板填写动态 specs、单 locale 翻译和 SEO/shipping JSON；`npm run test` 和 `npm run build` 通过 | `apps/admin/src/features/product` | Product list/form | Vitest + UI smoke |
| D6 | 前台产品列表 API | [x] | 已实现 `GET /api/public/products`，只返回 PUBLISHED 且 ACTIVE 分类产品，支持 category(id/slug/code 含子分类)、locale 翻译 fallback、分页、keyword 和 specs 参数筛选；`mvn -s .mvn-temp/settings.xml test` 通过，52 tests、0 failures、1 skipped | `product/public` | `GET /api/public/products` | MockMvc filter test |
| D7 | 前台产品详情 API | [x] | 已实现 `GET /api/public/products/{slug}`，仅返回 PUBLISHED 且 ACTIVE 分类产品，支持 locale 多语言 fallback、specs/localizedSpecs、shippingConfig、SEO，并预留 media/buttons 空数组；`mvn -s .mvn-temp/settings.xml test` 通过，54 tests、0 failures、1 skipped | `product/public` | `GET /api/public/products/{slug}` | MockMvc detail test |
| D8 | 前台产品详情页 | [ ] | 动态渲染参数、媒体、PDF、RFQ CTA | `apps/web/src/app/[locale]/products` | Product detail page | Playwright 页面 smoke |
| E1 | 配置 MinIO 客户端 | [ ] | 后端可连接 MinIO 并创建 bucket | `media/config` | `MinioClientConfig` | Testcontainers/Mock test |
| E2 | 创建媒体表 | [ ] | media_asset 和 product_media 可迁移 | migration, `media` | `media_asset`, `product_media` | migration test |
| E3 | 实现上传 API | [ ] | 支持图片、视频、PDF 上传并保存元数据 | `media/controller` | `POST /api/admin/media/upload` | MockMvc multipart |
| E4 | 实现媒体列表 API | [ ] | 支持按类型、文件名、上传人筛选 | `media/controller` | `GET /api/admin/media` | MockMvc pagination |
| E5 | 后台媒体中心页面 | [ ] | 可上传、预览、复制 URL、选择绑定 | `apps/admin/src/features/media` | Media library | Vitest component |
| E6 | 产品媒体绑定 | [ ] | 产品可绑定主图、图库、视频、PDF 手册 | `product`, `media` | `product_media` | Service test |
| F1 | 创建页面和区块表 | [ ] | site_page、site_page_block 可迁移 | migration, `page` | `site_page`, `site_page_block` | migration test |
| F2 | 创建按钮配置表 | [ ] | site_button_config 可迁移并支持 JSONB | migration, `button` | `site_button_config` | migration test |
| F3 | 实现页面管理 API | [ ] | 可创建页面、配置 slug、locale、SEO、状态 | `page/controller` | `GET/POST/PUT /api/admin/pages` | MockMvc CRUD |
| F4 | 实现页面区块 API | [ ] | 可排序、启停、配置 block JSON | `page/controller` | `GET/POST/PUT /api/admin/page-blocks` | JSONB validation test |
| F5 | 实现按钮配置 API | [ ] | 可配置按钮文案、位置、action、style | `button/controller` | `GET/POST/PUT /api/admin/buttons` | action validation test |
| F6 | 后台页面配置 UI | [ ] | 可维护页面、区块、按钮 | `apps/admin/src/features/page`, `button` | Page/block/button forms | Vitest |
| F7 | 前台动态页面 API | [ ] | 返回 page、blocks、buttons 和 fallback locale | `page/public` | `GET /api/public/site/page/{slug}` | MockMvc |
| F8 | 前台 block renderer | [ ] | 根据 block_type 白名单渲染组件 | `apps/web/src/components/page-blocks` | BlockRenderer | Vitest |
| F9 | 前台 button action renderer | [ ] | 根据 action_type 执行 RFQ、WhatsApp、download、AI 等 | `apps/web/src/components` | ButtonActionRenderer | Vitest |
| G1 | 实现前台全局布局 | [ ] | Header、Footer、语言切换、WhatsApp、AI 入口可见 | `apps/web/src/components/layout` | Layout | Playwright smoke |
| G2 | 实现首页 | [ ] | 首页由后台 page blocks 驱动渲染 | `apps/web/src/app/[locale]/page.tsx` | `GET /api/public/site/home` | Playwright |
| G3 | 实现分类页 | [ ] | 分类描述、筛选、产品列表、SEO 可渲染 | `apps/web/src/app/[locale]/categories` | category page | Playwright |
| G4 | 实现国家落地页 | [ ] | 国家内容、出口说明、案例、RFQ CTA 可渲染 | `apps/web/src/app/[locale]/markets` | market page | Playwright |
| G5 | 实现解决方案页 | [ ] | 应用场景和推荐车型可渲染 | `apps/web/src/app/[locale]/solutions` | solution page | Playwright |
| G6 | 实现案例、博客、FAQ 页面 | [ ] | 内容列表和详情可访问 | `apps/web/src/app/[locale]/cases`, `blogs`, `faq` | content pages | Playwright |
| G7 | 实现联系我们和 RFQ 入口 | [ ] | 联系方式、表单入口、来源 tracking 可用 | `apps/web/src/app/[locale]/contact` | contact page | Playwright |
| H1 | 创建询盘和跟进表 | [ ] | sales_lead、sales_follow_up 可迁移 | migration, `lead` | `sales_lead`, `sales_follow_up` | migration test |
| H2 | 实现公开 RFQ API | [ ] | 表单校验后保存 NEW 线索 | `lead/public` | `POST /api/public/leads` | MockMvc validation |
| H3 | 前台 RFQ 表单 | [ ] | 支持产品来源、国家、WhatsApp、附件、留言 | `apps/web/src/components/lead` | RFQ form | Vitest + Playwright |
| H4 | 后台询盘列表和详情 API | [ ] | 支持筛选、详情、来源页面、感兴趣产品 | `lead/admin` | `GET /api/admin/leads` | MockMvc |
| H5 | 实现销售分配和状态流转 | [ ] | 可分配负责人并更新状态 | `lead/service` | assign/status APIs | Service state test |
| H6 | 实现跟进记录 | [ ] | 可添加邮件、电话、WhatsApp、报价等跟进 | `lead/service` | `POST /api/admin/leads/{id}/follow-ups` | MockMvc |
| H7 | 后台 CRM 页面 | [ ] | 列表、详情、分配、状态、跟进操作可用 | `apps/admin/src/features/lead` | Lead pages | Vitest |
| H8 | 询盘导出 | [ ] | 可按筛选条件导出 CSV | `lead/export` | export endpoint | MockMvc file response |
| I1 | 配置 next-intl 多语言路由 | [ ] | en-US、es-MX、fr-DZ 路由可访问 | `apps/web/messages`, `middleware.ts` | locale routes | build + Playwright |
| I2 | 实现后端 locale fallback | [ ] | 缺失翻译返回 en-US 并标记 fallbackLocale | backend i18n helpers | fallback service | unit test |
| I3 | 后台多语言内容编辑组件 | [ ] | 表单可按 locale 切换编辑 | `apps/admin/src/components/i18n` | LocaleTabs | Vitest |
| I4 | SEO 字段模型和校验 | [ ] | 产品、分类、页面、文章都支持 SEO 字段 | `seo`, related modules | seo_title 等 | unit test |
| I5 | 前台 metadata 生成 | [ ] | title、description、canonical、OG、hreflang 正确 | `apps/web/src/lib/seo` | metadata helpers | Vitest |
| I6 | sitemap 和 robots | [ ] | 自动生成多语言 sitemap.xml 和 robots.txt | `apps/web/src/app/sitemap.ts`, `robots.ts` | SEO routes | build test |
| I7 | Schema.org 结构化数据 | [ ] | 产品、FAQ、文章输出 JSON-LD | `apps/web/src/lib/seo/schema.ts` | Product/FAQ schema | unit test |
| J1 | 创建 AI 聊天和知识库表 | [ ] | ai_chat_session、ai_chat_message、ai_knowledge_document、chunk 可迁移 | migration, `ai` | AI tables + pgvector | migration test |
| J2 | 实现 AI Provider 抽象 | [ ] | 可切换 Spring AI 或 custom provider | `ai/provider` | `LlmClient` | unit test mock provider |
| J3 | 实现知识库文档管理 API | [ ] | 后台可创建文档、标记索引状态 | `ai/admin` | `GET/POST /api/admin/ai/knowledge` | MockMvc |
| J4 | 实现 PDF/内容入库索引流程 | [ ] | 文档可拆 chunk、生成 embedding、写入 pgvector | `ai/rag` | `KnowledgeIndexer` | integration test |
| J5 | 实现 AI 工具 search_products | [ ] | 工具可按车型、国家、容量等检索产品 | `ai/tools` | `search_products` | tool unit test |
| J6 | 实现 AI 工具 get_product_detail 和 brochure | [ ] | 工具可返回产品详情和 PDF 链接 | `ai/tools` | `get_product_detail`, `get_brochure_link` | tool unit test |
| J7 | 实现 AI 工具 FAQ 和国家出口信息 | [ ] | 工具可检索 FAQ、国家落地页和出口指南 | `ai/tools` | `get_faq_answer`, `get_country_shipping_info` | tool unit test |
| J8 | 实现 AI 创建线索工具 | [ ] | 客户留下联系方式后可创建 sales_lead | `ai/tools`, `lead` | `create_sales_lead` | MockMvc + service test |
| J9 | 实现公开 AI chat API | [ ] | 支持会话、RAG、工具调用、聊天记录 | `ai/public` | `POST /api/public/ai/chat` | integration test |
| J10 | 前台 AI 聊天窗口 | [ ] | 可多语言聊天、展示工具结果、引导 RFQ | `apps/web/src/components/ai` | Chat widget | Playwright |
| J11 | 后台 AI 聊天记录页面 | [ ] | 可查看会话、消息、关联线索 | `apps/admin/src/features/ai` | Chat session page | Vitest |
| J12 | AI 安全护栏评估 | [ ] | 不编造价格、库存、认证、交期 | `ai/eval` | guardrail tests | AI eval cases |
| K1 | 后端集成测试补齐 | [ ] | 核心 CRUD、RFQ、AI tool 使用 Testcontainers | `apps/backend/src/test` | integration tests | `mvn verify` |
| K2 | 前台组件测试补齐 | [ ] | block、button、RFQ、SEO helper 覆盖 | `apps/web/src/**/*.test.tsx` | component tests | `npm run test` |
| K3 | 后台组件测试补齐 | [ ] | CRUD 表格、表单、权限 guard 覆盖 | `apps/admin/src/**/*.test.tsx` | component tests | `npm run test` |
| K4 | E2E 全链路测试 | [ ] | 后台建分类和产品，前台询盘，后台跟进 | `tests/e2e` | Playwright specs | `npm run test` |
| K5 | 性能和缓存 smoke | [ ] | 首页、分类、产品缓存可命中并可失效 | backend/web cache code | Redis cache | integration test |
| L1 | 编写 Dockerfile | [ ] | backend、web、admin 都可构建镜像 | app Dockerfiles | Docker images | `docker compose build` |
| L2 | 配置 Nginx | [ ] | web、admin、backend API、media proxy 路由正确 | `infra/nginx` | reverse proxy | `docker compose config` |
| L3 | 完善 docker-compose | [ ] | 一条命令启动完整系统 | `docker-compose.yml`, `.env.example` | all services | `docker compose up -d --build` |
| L4 | 生成 README 和 setup 文档 | [ ] | 本地启动、测试、部署、账号说明完整 | `README.md`, `docs/setup.md` | docs | 文档检查 |
| L5 | 生成验收计划 | [ ] | ACCEPTANCE_TEST_PLAN.md 覆盖核心流程 | `ACCEPTANCE_TEST_PLAN.md` | acceptance cases | 逐项检查 |
| L6 | 打包前清理和交付检查 | [ ] | dry-run 清理、secret scan、测试状态记录 | packaging report | no source removal | clean_project dry-run |

