# DEV_SPEC.md

版本：v0.1  
来源：`prompt.md`  
项目：B2B 外贸特种卡车 / 多功能工具车独立站系统  
状态：开发规范初稿  
语言：中文

> 本文档是后续 `project-setup`、`auto-coder`、`progress-checker`、`acceptance-tester`、`project-doc-writer` 和 `project-packager` 的项目级输入。为了兼容自动化任务解析，排期章节固定为 `## 6. Delivery Schedule`。

## 1. Project Overview

### 1.1 项目是什么

本项目是一个面向海外客户的 B2B 外贸独立站系统，主营特种卡车和多功能工具车。系统由三部分组成：

- 前台独立站：用于产品展示、SEO 获客、询盘转化、市场落地页建设和 AI 选型咨询。
- 后台 CMS + CRM：用于运营人员维护产品、媒体、页面、SEO、多语言内容，销售人员管理询盘和客户跟进。
- AI 客户助手：基于产品、FAQ、出口指南、案例、PDF 手册等知识源，为海外客户提供车型选型和询盘引导。

项目不是普通展示型官网，而是：

**B2B 外贸获客独立站 + 后台 CMS + 询盘 CRM + AI Truck Selection Assistant。**

### 1.2 设计理念

- 以询盘转化为核心，而不是单纯展示公司信息。
- 以可配置能力为核心，车型、参数、页面模块、按钮行为、多语言内容都不能写死。
- 以前台 SEO 和内容沉淀为长期获客资产。
- 以后台运营效率为日常增长能力。
- 以 AI 助手降低客户选型门槛，并把高意向对话转化为销售线索。
- 首版采用模块化单体，避免微服务复杂度，同时保留后续拆分空间。

### 1.3 项目定位

项目定位为海外 B2B 买家获取和转化平台，重点服务以下目标：

- 让海外客户快速找到合适车型。
- 让客户清楚了解参数、配置、应用场景、出口流程和售后能力。
- 让客户通过 RFQ 表单、WhatsApp、邮箱和 AI 助手快速联系销售。
- 让运营、销售、美工、SEO 人员可以在后台独立维护内容。
- 让老板能看到基础业务数据、询盘来源和转化情况。
- 让 Google 能持续收录产品页、分类页、国家落地页、博客页和 FAQ 页面。

### 1.4 目标客户与市场

首版重点市场：

- 墨西哥：西班牙语 + 英语。
- 阿尔及利亚：法语 + 英语，后续扩展阿拉伯语。
- 南美洲西语国家：西班牙语 + 英语。

后续扩展市场：

- 巴西：葡萄牙语 + 英语。
- 中东、非洲、东南亚等更多海外市场。

目标访客角色：

- 进口商、经销商、工程承包商。
- 物流、道路救援、市政、能源、矿山、建筑等行业采购人员。
- 需要定制车辆配置的终端企业客户。

后台用户角色：

- 超级管理员：系统设置、用户权限、全局配置。
- 运营人员：产品、分类、页面、媒体、FAQ、案例维护。
- 销售人员：询盘分配、跟进记录、成交状态维护。
- SEO 人员：标题、描述、关键词、落地页、博客、结构化数据维护。
- 美工 / 内容人员：图片、视频、PDF、页面模块素材维护。
- 老板 / 管理层：查看仪表盘、线索趋势、询盘转化情况。

### 1.5 主要产品范围

首版覆盖以下产品类型，所有类型必须由后台动态配置，不能写死在代码中：

- 清障车 / Tow Truck / Wrecker Truck。
- 油罐车 / Fuel Tank Truck。
- 货运卡车 / Cargo Truck。
- 高空作业车 / Aerial Work Platform Truck。
- 自卸车 / Dump Truck。
- 洒水车 / Water Tank Truck。
- 垃圾车 / Garbage Truck。
- 随车吊 / Crane Truck。
- 冷藏车 / Refrigerated Truck。
- 定制多功能工具车 / Customized Utility Truck。

### 1.6 系统边界

首版包含：

- 前台网站。
- 后台管理系统。
- 后端 API。
- PostgreSQL 数据库。
- Redis 缓存。
- MinIO / S3-compatible 对象存储。
- pgvector 向量检索。
- AI 聊天、工具调用、线索创建。
- Docker Compose 本地和基础生产部署。

首版不包含：

- 在线支付。
- 复杂 ERP。
- 复杂库存系统。
- 完整移动 App。
- 自动正式报价。
- 多供应商交易市场。
- Kubernetes 生产集群。

### 1.7 前台和后台分别解决什么问题

前台解决：

- 海外客户了解产品、参数、应用场景和出口能力。
- Google 收录可索引页面。
- 客户通过 RFQ、WhatsApp、邮箱和 AI 助手发起询盘。
- 不同国家客户看到本地化语言和市场内容。

后台解决：

- 运营人员自主维护车型、参数、产品、媒体、页面模块和按钮。
- SEO 人员维护多语言元信息、slug、canonical、sitemap 内容。
- 销售人员接收、分配、跟进、导出和转化询盘。
- AI 管理员维护知识库、查看聊天记录和分析高频问题。

### 1.8 成功标准

首版完成后应达到：

- 后台可动态创建车型分类和参数模板。
- 后台可发布产品，前台可按分类、参数和语言展示。
- 首页、分类页、产品页、国家落地页、博客、FAQ 可被搜索引擎抓取。
- 客户可提交 RFQ，后台自动生成销售线索。
- 销售可分配负责人、更新状态、添加跟进记录。
- AI 助手可基于知识库回答产品和出口问题，并能引导创建询盘。
- Docker Compose 可启动完整系统。

## 2. Features

### 2.1 核心特点

| 特点 | 说明 |
|------|------|
| 前台 + 后台一体化 | 前台负责获客转化，后台负责内容、产品、询盘和 AI 知识维护。 |
| 产品车型可插拔 | 车型分类由后台配置，代码不固定清障车、油罐车等具体类型。 |
| 产品参数可插拔 | 每个车型绑定不同参数模板，产品详情页动态渲染参数。 |
| 页面模块可插拔 | 首页、落地页、产品页等由 block 配置驱动，支持排序、隐藏、绑定内容。 |
| 按钮行为可插拔 | 按钮可配置 RFQ、WhatsApp、邮箱、下载手册、打开 AI、产品对比等行为。 |
| 多语言能力 | 首版支持英语、西班牙语、法语；后续扩展葡萄牙语、阿拉伯语。 |
| 询盘 CRM | RFQ 自动生成销售线索，支持分配、状态、跟进、导出和来源追踪。 |
| 销售跟进 | 每条线索可记录电话、邮件、WhatsApp、报价、成交、丢单等事件。 |
| AI 客户助手 | 定位为 Truck Selection Assistant，不是普通闲聊机器人。 |
| SEO 友好 | Next.js SSR/SSG、多语言 hreflang、sitemap、结构化数据、canonical。 |
| 媒体管理 | 图片、视频、PDF 上传到对象存储，数据库保存元数据。 |
| 数据可沉淀 | 产品、线索、聊天、FAQ、案例、国家内容形成长期数据资产。 |
| 后续可扩展 | 预留支付、ERP、库存、Kubernetes、多市场、多 AI provider 扩展空间。 |

### 2.2 前台网站能力

前台页面：

- 首页。
- 产品分类页。
- 产品详情页。
- 国家落地页。
- 解决方案页。
- 成功案例页。
- 博客 / 采购指南 / 出口指南。
- FAQ 页面。
- 关于我们页面。
- 联系我们页面。
- RFQ 询盘表单。
- AI 车辆选型助手入口。

转化元素：

- Hero CTA。
- RFQ 弹窗或独立表单。
- WhatsApp 浮动按钮。
- 邮箱联系按钮。
- 下载产品手册按钮。
- 产品对比入口。
- AI 助手入口。
- 案例、证书、工厂实力、出口经验背书。

前台必须支持：

- 根据 locale 渲染多语言内容。
- 根据 SEO 字段生成 metadata。
- 根据 page block 配置渲染页面模块。
- 根据 button action 配置执行按钮行为。
- 根据车型参数模板动态渲染产品 specs。
- 在产品、分类、市场、文章页面中嵌入 RFQ。

### 2.3 后台管理能力

后台模块：

- 用户登录。
- 角色权限。
- 产品管理。
- 车型分类管理。
- 车型参数模板管理。
- 图片 / 视频 / PDF 媒体管理。
- 页面管理。
- 页面区块管理。
- 按钮配置管理。
- 多语言内容管理。
- SEO 管理。
- 询盘管理。
- 销售跟进记录。
- 客户线索管理。
- AI 知识库管理。
- AI 聊天记录管理。
- 系统设置。

后台通用要求：

- 所有列表支持分页、筛选、排序。
- 所有关键写操作记录 audit log。
- 所有需要多语言的内容支持 locale 维度维护。
- 所有动态配置字段必须有基本 schema 校验。
- 后台上传文件必须校验类型、大小和扩展名。

### 2.4 车型与参数可插拔

数据链路：

```text
vehicle_category
  -> vehicle_attribute_definition
  -> product.specs JSONB
  -> product_translation
  -> public product detail rendering
  -> admin dynamic form rendering
```

示例：

- 油罐车关注容量、材质、分仓数量、油泵、流量计、加油机、安全阀、底盘品牌、排放标准。
- 清障车关注平台长度、拖举能力、绞盘能力、液压系统、控制方式、底盘品牌、驱动形式。

实现要求：

- 后台可以创建分类、启停分类、排序分类、配置 SEO。
- 后台可以为分类创建参数定义，参数支持 number、text、select、multi_select、boolean、range。
- 参数定义可配置单位、选项、是否必填、是否筛选、排序、校验规则。
- 产品保存 specs 时按参数定义校验。
- 前台根据参数定义控制显示顺序、单位、筛选项和对比字段。

### 2.5 页面模块与按钮可插拔

页面由 `site_page` 和 `site_page_block` 驱动。

页面 block 支持：

- Hero Banner。
- 产品分类入口。
- 热门产品。
- 推荐车型。
- 应用场景。
- 出口国家。
- 成功案例。
- 工厂实力。
- FAQ。
- AI 助手入口。
- 询盘 CTA。
- 博客列表。
- 产品参数对比。
- PDF 下载区。

按钮 action 支持：

- 打开 RFQ 表单。
- 打开 WhatsApp。
- 打开邮箱。
- 跳转自定义链接。
- 下载产品手册。
- 打开 AI 助手。
- 加入产品对比。
- 跳转产品详情。
- 跳转分类页面。
- 滚动到指定页面区域。

实现要求：

- block 和 button 的 `config` 使用 PostgreSQL JSONB 存储。
- 前端使用白名单组件映射 `block_type`，不能直接执行后端传来的任意代码。
- 按钮 action 使用白名单解析，未知 action 显示禁用状态并记录错误。

### 2.6 多语言能力

首版 locale：

- `en-US`：英语。
- `es-MX`：西班牙语，优先服务墨西哥和拉美西语市场。
- `fr-DZ`：法语，优先服务阿尔及利亚市场。

后续 locale：

- `pt-BR`：葡萄牙语，服务巴西市场。
- `ar-DZ`：阿拉伯语，服务阿尔及利亚和中东市场。

多语言覆盖：

- 产品基础信息。
- 产品 specs 展示文案。
- 分类名称和描述。
- 页面标题、副标题、区块内容。
- 按钮文本。
- FAQ。
- SEO title、description、keywords、slug、canonical。
- AI 助手回答。

降级策略：

- 请求 locale 内容不存在时，优先 fallback 到 `en-US`。
- fallback 内容必须在响应中标记 `fallbackLocale`，便于前端和后台排查。
- 不允许空白页面；缺失翻译时显示默认语言内容。

### 2.7 询盘 CRM

RFQ 字段：

- 姓名。
- 公司名称。
- 国家。
- 邮箱。
- WhatsApp。
- 感兴趣产品。
- 车型类型。
- 数量。
- 用途。
- 目标容量。
- 底盘偏好。
- 排放标准。
- 目的港。
- 预算范围。
- 参考图片上传。
- 留言。

询盘状态：

```text
NEW
CONTACTED
QUOTED
NEGOTIATING
WON
LOST
INVALID
```

销售能力：

- 查看询盘列表。
- 查看询盘详情。
- 分配销售负责人。
- 修改询盘状态。
- 添加跟进记录。
- 标记是否报价。
- 标记是否成交。
- 导出询盘数据。
- 查看来源页面。
- 查看客户感兴趣产品。

### 2.8 AI 客户助手

AI 助手定位为 `Truck Selection Assistant`，核心目标是：

- 回答产品问题。
- 推荐车型。
- 解释车辆参数。
- 解释不同配置区别。
- 回答出口流程。
- 回答售后政策。
- 回答常见付款和运输问题。
- 根据客户国家推荐合适车型。
- 引导客户提交 RFQ。
- 客户留下联系方式后创建销售线索。

AI 禁止：

- 编造最终价格。
- 编造实时库存。
- 编造未确认认证。
- 承诺无法保证的交货期。
- 替销售给出正式报价。
- 在缺少条件时给出确定性工程结论。

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

## 4. Testing Strategy

### 4.1 测试理念

采用 TDD 倾向的增量开发方式：

- 每个任务必须有可验证输出。
- 后端业务规则优先写单元测试或集成测试。
- 前端动态渲染和表单校验必须有组件测试。
- 核心用户流程必须有 E2E 测试。
- AI 助手必须有评估用例，不允许只凭人工体验判断。

任务完成标准：

- 有命令退出码、测试输出、构建输出、HTTP 响应、UI 渲染结果或生成文件作为证据。
- 不能仅凭代码存在标记 `[x]`。
- 如果无法验证，必须记录阻塞原因。

### 4.2 后端测试

测试工具：

```text
JUnit 5
Mockito
Testcontainers
Spring Boot Test
MockMvc
```

覆盖范围：

- 用户登录、JWT 生成、权限拦截。
- 分类新增、启停、排序、slug 唯一性。
- 参数模板定义、校验、产品 specs 校验。
- 产品草稿、发布、多语言、SEO、媒体绑定。
- MinIO 上传元数据保存。
- 页面 block 和按钮 action 配置校验。
- RFQ 表单提交、销售线索状态流转、跟进记录。
- AI 工具调用参数校验和线索创建。
- Flyway migration 可执行。

预期命令：

```powershell
cd apps/backend
mvn test
mvn verify
```

### 4.3 前台测试

测试工具：

```text
Vitest
Testing Library
Playwright
```

覆盖范围：

- 首页 block 渲染。
- 分类页产品筛选。
- 产品详情页动态 specs。
- RFQ 表单校验和提交。
- 多语言路由和 fallback。
- SEO metadata 生成。
- AI 聊天入口和基础交互。

预期命令：

```powershell
cd apps/web
npm run test
npm run build
```

### 4.4 后台测试

覆盖范围：

- 登录页。
- 权限菜单。
- 产品 CRUD。
- 分类和参数模板配置。
- 媒体上传 UI。
- 页面 block 表单。
- 按钮 action 配置。
- 询盘列表、详情、分配、跟进。
- AI 知识库和聊天记录页面。

预期命令：

```powershell
cd apps/admin
npm run test
npm run build
```

### 4.5 E2E 测试

核心场景：

- 后台创建车型分类和参数模板，前台分类页可见。
- 后台发布产品，前台产品详情页展示多语言内容和动态 specs。
- 前台提交 RFQ，后台 sales lead 列表出现新线索。
- 后台销售分配负责人并添加跟进记录。
- 前台 AI 助手推荐产品并引导创建询盘。
- SEO 页面生成正确 canonical、hreflang、Open Graph 和结构化数据。

预期命令：

```powershell
cd tests/e2e
npm run test
```

### 4.6 AI 助手评估

AI 评估必须覆盖：

- 产品推荐准确性。
- 参数解释准确性。
- 出口流程问答。
- 多语言回答。
- 禁止胡乱报价。
- 禁止编造库存和认证。
- create_sales_lead 工具调用。
- get_brochure_link 工具调用。

AI 输出必须满足：

- 不知道时说明需要销售确认。
- 涉及价格时引导 RFQ。
- 涉及交期、认证、库存时使用保守表述。
- 回答语言与客户输入语言一致，或与页面 locale 一致。

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
| C2 | 实现后台分类 CRUD API | [ ] | 后台可新增、编辑、启停、排序分类 | `category/controller` | `GET/POST/PUT /api/admin/categories` | MockMvc CRUD |
| C3 | 实现后台分类管理页面 | [ ] | Ant Design Tree/Table 可维护分类 | `apps/admin/src/features/category` | Category list/form | Vitest component test |
| C4 | 创建参数定义表和实体 | [ ] | 可为分类配置动态参数模板 | migration, `attribute` | `vehicle_attribute_definition` | Repository test |
| C5 | 实现参数模板 CRUD API | [ ] | 参数支持类型、单位、选项、必填、筛选、校验规则 | `attribute/controller` | `GET/POST/PUT /api/admin/attributes` | MockMvc validation |
| C6 | 后台参数模板表单 | [ ] | 可为油罐车、清障车配置不同参数 | `apps/admin/src/features/attribute` | Attribute editor | Vitest 表单校验 |
| C7 | 前台公开分类 API | [ ] | 前台可获取启用分类树和 SEO 字段 | `category/public` | `GET /api/public/categories` | MockMvc public API |
| D1 | 创建产品核心表 | [ ] | product、product_translation 可迁移 | migration, `product` | `product`, `product_translation` | Testcontainers migration |
| D2 | 实现产品 specs 校验 | [ ] | 保存产品时按分类参数模板校验 JSONB specs | `product/service` | `ProductSpecValidator` | 单元测试各字段类型 |
| D3 | 实现后台产品 CRUD API | [ ] | 可创建草稿、更新、发布、删除产品 | `product/controller` | `GET/POST/PUT/DELETE /api/admin/products` | MockMvc CRUD |
| D4 | 实现产品多语言维护 | [ ] | 产品名称、描述、SEO 可按 locale 保存 | `product/translation` | `product_translation` | Service test fallback |
| D5 | 后台产品列表和编辑页 | [ ] | 可选择分类、填写动态参数、多语言、SEO | `apps/admin/src/features/product` | Product list/form | Vitest + UI smoke |
| D6 | 前台产品列表 API | [ ] | 支持分类、locale、分页、参数筛选 | `product/public` | `GET /api/public/products` | MockMvc filter test |
| D7 | 前台产品详情 API | [ ] | 返回产品、多语言、specs、媒体、SEO | `product/public` | `GET /api/public/products/{slug}` | MockMvc detail test |
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

## 7. Future Work

首版后续扩展：

- 在线支付和定金支付。
- 复杂 ERP 对接。
- 复杂库存系统。
- 自动报价审批流。
- 多供应商或多工厂管理。
- WhatsApp Business API 深度集成。
- 邮件营销和自动跟进。
- 更完整的 BI 仪表盘。
- Kubernetes 部署。
- CDN、图片处理服务、视频转码。
- 独立 AI worker 和异步知识库索引队列。
- 专门的全文搜索引擎，如 OpenSearch。
- 移动 App 或 PWA。
- 多站点、多品牌、多域名管理。

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

## 9. Core Business Flows

### 9.1 产品上架 Flow

```text
运营登录后台
  -> 选择车型分类
  -> 系统加载该分类参数模板
  -> 填写产品基础信息
  -> 填写多语言内容
  -> 上传图片 / 视频 / PDF
  -> 填写动态参数
  -> 设置 SEO
  -> 设置是否进入 AI 知识库
  -> 保存草稿 / 发布
  -> 前台产品页可访问
```

关键规则：

- 分类必须是 ACTIVE。
- 产品 slug 全局唯一。
- 产品 specs 必须通过参数模板校验。
- 发布前至少需要默认语言名称、分类、slug、状态、主图。
- 发布后如果 `ai_enabled=true`，创建或更新 AI 知识库索引任务。

失败处理：

- 参数校验失败返回字段级错误。
- 媒体缺失时可保存草稿，但不能发布为推荐产品。
- SEO 字段缺失时允许发布，但后台显示待优化提示。

验收：

- 后台创建油罐车分类和容量参数。
- 新建产品填写 `tank_capacity=10000`。
- 发布后前台产品页显示 `10,000 L`。
- AI 知识库出现对应产品文档。

### 9.2 媒体上传 Flow

```text
后台选择文件
  -> 后端校验文件类型和大小
  -> 上传到 MinIO
  -> 生成 object_key 和 public_url
  -> 保存 media_asset 记录
  -> 绑定到产品 / 页面 / 案例
```

校验规则：

- 图片：jpg、jpeg、png、webp。
- 视频：mp4、webm。
- PDF：pdf。
- 文件大小由系统设置控制，默认图片 10MB、视频 200MB、PDF 50MB。
- object_key 使用日期目录和随机 UUID，避免覆盖。

验收：

- 上传一张产品图片后返回 media_asset id。
- MinIO 中存在对象。
- 后台媒体列表可预览。
- 产品可绑定该图片为主图。

### 9.3 页面渲染 Flow

```text
用户访问页面
  -> Next.js 请求页面数据
  -> 后端返回 page + blocks + buttons
  -> 前端根据 block_type 匹配组件
  -> 根据 config 渲染内容
  -> 根据 button action_type 渲染行为
```

关键规则：

- 前端只支持白名单 block type。
- block config 不允许包含可执行脚本。
- 未知 block type 显示后台配置错误占位，仅在非生产环境可见。
- button action 未知时按钮禁用并记录日志。
- 页面不存在返回 404，未发布页面前台不可见。

验收：

- 后台调整首页 block 顺序，前台刷新后顺序变化。
- 后台隐藏 FAQ block，前台不展示。
- 后台修改 WhatsApp 按钮模板，前台链接变化。

### 9.4 询盘 Flow

```text
客户提交 RFQ
  -> 后端校验表单
  -> 保存 sales_lead
  -> AI 可选生成需求摘要
  -> 通知销售
  -> 销售后台查看
  -> 销售添加跟进记录
  -> 更新线索状态
```

关键规则：

- email 和 WhatsApp 至少填写一个。
- country 必填。
- message 或 interested_product 至少有一个。
- status 初始为 NEW。
- source_context 必须记录来源页面、locale、utm、产品 id。
- 线索分配后记录 audit_log。

验收：

- 前台产品页提交 RFQ。
- 后台列表出现 NEW 线索。
- 销售分配负责人并添加 WhatsApp 跟进。
- 状态可从 NEW 改为 CONTACTED、QUOTED、NEGOTIATING、WON、LOST、INVALID。

### 9.5 AI 助手 Flow

```text
客户输入问题
  -> 语言识别
  -> 意图识别
  -> 判断是否需要工具调用
  -> 搜索产品 / 检索 FAQ / 检索出口说明
  -> 生成回答
  -> 引导 RFQ
  -> 如果客户留下联系方式，创建 sales_lead
```

关键规则：

- 对产品查询优先使用工具 `search_products`。
- 对产品详情优先使用 `get_product_detail`。
- 对出口国家问题优先使用 `get_country_shipping_info`。
- 对价格问题必须引导 RFQ，不给最终报价。
- 对库存、认证、交期问题必须使用保守表述。
- 每轮消息保存到 `ai_chat_message`。

验收：

- 输入 `I need a 10,000L fuel tank truck for Mexico`，AI 推荐油罐车并询问容量、底盘、排放标准、目的港。
- 输入 `How can I get CIF price?`，AI 引导填写目的港和 RFQ，不直接报价。
- 客户提供 name、email、country、need 后，AI 调用 `create_sales_lead`。

## 10. Pluggable Configuration Design

### 10.1 车型分类可插拔

车型分类由 `vehicle_category` 驱动，前后台都通过 API 获取分类树。

配置要求：

- 支持父子级。
- 支持启停。
- 支持排序。
- 支持 slug。
- 支持分类默认 SEO。
- 支持分类展示图标和封面。

### 10.2 产品参数可插拔

参数定义示例：

```json
{
  "category": "fuel-tank-truck",
  "attributes": [
    {
      "code": "tank_capacity",
      "name": "Tank Capacity",
      "type": "number",
      "unit": "L",
      "required": true,
      "filterable": true,
      "comparable": true,
      "validation": {
        "min": 1000,
        "max": 50000
      }
    },
    {
      "code": "tank_material",
      "name": "Tank Material",
      "type": "select",
      "options": ["Carbon Steel", "Stainless Steel", "Aluminum Alloy"],
      "filterable": true
    }
  ]
}
```

产品 specs 示例：

```json
{
  "tank_capacity": 10000,
  "tank_material": "Carbon Steel",
  "compartments": 3,
  "chassis_brand": "Sinotruk",
  "emission_standard": "Euro III"
}
```

### 10.3 页面区块可插拔

页面 block 示例：

```json
{
  "blockKey": "home_featured_products",
  "blockType": "FEATURED_PRODUCTS",
  "locale": "en-US",
  "visible": true,
  "sortOrder": 30,
  "contentConfig": {
    "title": "Popular Trucks for Export",
    "subtitle": "Reliable truck solutions for Mexico, Algeria and South America",
    "productIds": [101, 102, 103],
    "categoryCodes": ["fuel-tank-truck", "tow-truck"]
  },
  "styleConfig": {
    "layout": "grid",
    "columns": 3
  }
}
```

前端 block type 白名单：

- `HERO_BANNER`
- `CATEGORY_ENTRY`
- `FEATURED_PRODUCTS`
- `RECOMMENDED_TRUCKS`
- `APPLICATION_SCENARIOS`
- `EXPORT_COUNTRIES`
- `SUCCESS_CASES`
- `FACTORY_STRENGTH`
- `FAQ`
- `AI_ASSISTANT_ENTRY`
- `RFQ_CTA`
- `BLOG_LIST`

### 10.4 按钮动作可插拔

按钮配置示例：

```json
{
  "buttonKey": "product_detail_whatsapp",
  "placement": "PRODUCT_DETAIL_HERO",
  "locale": "en-US",
  "text": "Chat on WhatsApp",
  "actionType": "OPEN_WHATSAPP",
  "actionConfig": {
    "phone": "+8613800000000",
    "messageTemplate": "Hello, I am interested in {productName}. Please send me the price and specifications."
  },
  "styleConfig": {
    "variant": "primary",
    "size": "large"
  }
}
```

action type 白名单：

- `OPEN_RFQ`
- `OPEN_WHATSAPP`
- `OPEN_EMAIL`
- `OPEN_CUSTOM_LINK`
- `DOWNLOAD_BROCHURE`
- `OPEN_AI_ASSISTANT`
- `ADD_TO_COMPARE`
- `GO_PRODUCT_DETAIL`
- `GO_CATEGORY_PAGE`
- `SCROLL_TO_SECTION`

### 10.5 AI 工具可插拔

工具注册配置示例：

```json
{
  "toolName": "search_products",
  "enabled": true,
  "description": "Search published truck products by category, country, capacity, chassis and emission standard.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "categoryCode": { "type": "string" },
      "country": { "type": "string" },
      "capacity": { "type": "number" },
      "emissionStandard": { "type": "string" }
    }
  },
  "safetyRules": {
    "noFinalPrice": true,
    "requirePublishedProduct": true
  }
}
```

### 10.6 多语言内容可插拔

多语言响应示例：

```json
{
  "locale": "es-MX",
  "fallbackLocale": "en-US",
  "name": "Camión cisterna de combustible 10,000L",
  "missingFields": ["seo_keywords"]
}
```

规则：

- 后台可按 locale 切换编辑。
- 前台请求 locale 不存在时 fallback。
- SEO slug 建议每个 locale 独立配置。
- AI 回答语言优先使用用户输入语言，其次使用页面 locale。

## 11. AI Assistant Design

### 11.1 AI 助手定位

AI 助手是外贸卡车选型顾问，不是普通闲聊机器人。

名称建议：

- Truck Selection Assistant。
- Export Truck Advisor。
- AI Vehicle Consultant。

核心职责：

- 帮客户明确需求。
- 推荐合适车型或产品。
- 解释参数和配置区别。
- 提供出口流程、付款、运输、售后 FAQ。
- 引导客户提交 RFQ。
- 在客户留下联系方式后创建销售线索。

### 11.2 AI 回答范围

允许回答：

- 产品类型介绍。
- 产品参数解释。
- 车型推荐。
- 使用场景匹配。
- 国家出口经验和常见流程。
- 售后政策说明。
- 付款、运输、CIF/FOB 等基础贸易术语解释。
- PDF 手册链接。
- RFQ 所需信息提示。

禁止回答：

- 未经确认的最终价格。
- 实时库存。
- 虚假认证。
- 无法保证的交货期。
- 法律、税务、海关最终结论。
- 与产品和出口业务无关的闲聊。

### 11.3 AI 知识来源

知识源：

- 产品信息。
- 产品参数。
- FAQ。
- 出口指南。
- 售后政策。
- 公司介绍。
- 成功案例。
- 国家落地页内容。
- 博客文章。
- PDF 产品手册。

索引规则：

- 只有 `ai_enabled=true` 的内容进入知识库。
- 文档变更后重新计算 content_hash。
- content_hash 未变化时不重复索引。
- chunk 保存 source_type、source_id、locale、title、url。

### 11.4 RAG 检索流程

```text
Normalize message
  -> detect language and market
  -> extract intent and entities
  -> vector search by locale
  -> fallback search in en-US
  -> optional tool calling
  -> rerank context
  -> generate answer with guardrails
  -> store message and retrieval_context
```

检索策略：

- 优先当前 locale。
- 当前 locale 不足时 fallback 到 `en-US`。
- 产品精确查询优先工具调用。
- FAQ 类型问题优先 FAQ 工具。
- PDF 手册请求优先 brochure 工具。

### 11.5 Tool Calling 设计

| Tool | 用途 | 输入参数 | 输出结构 | 使用场景 | 测试方法 |
|------|------|----------|----------|----------|----------|
| `search_products` | 按需求搜索已发布产品 | `locale`, `categoryCode`, `country`, `capacity`, `emissionStandard`, `chassisBrand`, `keywords` | `items[]` 包含 id、name、slug、category、summary、matchedSpecs | 客户描述需求但没有指定产品 | 构造 10,000L Mexico 问题，断言返回油罐车 |
| `get_product_detail` | 获取产品详情 | `productId` 或 `slug`, `locale` | 产品基础信息、specs、media、brochure、RFQ URL | 客户询问某个产品参数 | 单元测试 slug 命中和 locale fallback |
| `list_vehicle_categories` | 返回可用车型分类 | `locale` | 分类 code、name、slug、description | 客户不知道有哪些车型 | 断言只返回 ACTIVE 分类 |
| `get_country_shipping_info` | 获取国家出口说明 | `country`, `locale` | 出口流程、常见港口、文档要求、案例链接 | 客户问能否出口到 Algeria/Mexico | 测试国家不存在时返回保守说明 |
| `get_faq_answer` | 检索 FAQ | `question`, `locale`, `categoryCode` | question、answer、sourceUrl | 客户问付款、运输、售后 | 测试多语言 fallback |
| `create_sales_lead` | 创建销售线索 | `name`, `email` 或 `whatsapp`, `country`, `message`, `interestedProductId`, `requirements` | leadId、leadNo、status | 客户留下联系方式 | 测试缺少联系方式时拒绝创建 |
| `get_brochure_link` | 获取产品手册链接 | `productId` 或 `slug`, `locale` | brochureUrl、fileName、sizeBytes | 客户要求规格书 | 测试无 PDF 时返回建议提交 RFQ |

### 11.6 AI 创建询盘规则

创建 sales lead 前必须满足：

- 客户明确留下姓名或公司名称。
- email 和 WhatsApp 至少一个。
- country 必填或可从对话中明确推断。
- message 或需求摘要非空。

AI 创建 lead 后：

- 线索状态为 NEW。
- source_context 标记为 `AI_CHAT`。
- 关联 ai_chat_session。
- AI 回复中说明销售会进一步确认配置和报价。

### 11.7 防止胡乱报价

提示词和后端 guardrail 必须包含：

- 不提供最终价格。
- 可以解释影响价格的因素，如底盘品牌、容量、排放标准、上装配置、目的港、数量。
- 如果客户要求 CIF 价格，必须引导客户提供目的港、配置和联系方式。
- 回答使用：`Our sales team can provide an accurate quotation after confirming...`

### 11.8 多语言回答

语言策略：

- 如果用户用西班牙语提问，用西班牙语回答。
- 如果用户用法语提问，用法语回答。
- 如果用户语言识别不确定，使用页面 locale。
- 专业术语可保留英文，并在必要时解释。

## 12. API Design

### 12.1 API 通用约定

响应包裹：

```json
{
  "success": true,
  "data": {},
  "error": null,
  "requestId": "req_123"
}
```

分页响应：

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 100
}
```

认证：

- public API 不需要后台 JWT，但需要限流和基础防刷。
- admin API 需要 JWT。
- 后台写操作需要权限点。

### 12.2 前台 API

| Method | Endpoint | 请求参数 | 响应结构 | 权限 | 核心逻辑与测试方法 |
|--------|----------|----------|----------|------|--------------------|
| GET | `/api/public/site/home` | `locale` | page、blocks、buttons、seo | Public | 获取已发布首页；测试 block 排序和 locale fallback |
| GET | `/api/public/site/page/{slug}` | `slug`, `locale` | page、blocks、buttons、seo | Public | 获取已发布动态页面；测试 404 和未发布不可见 |
| GET | `/api/public/categories` | `locale` | 分类树 | Public | 只返回 ACTIVE 分类；测试排序和 fallback |
| GET | `/api/public/categories/{slug}` | `slug`, `locale`, filters | 分类详情、参数筛选、产品分页 | Public | 分类页数据聚合；测试参数筛选 |
| GET | `/api/public/products` | `locale`, `category`, `page`, `pageSize`, specs filters | 产品分页 | Public | 只返回 PUBLISHED 产品；测试 specs JSONB 查询 |
| GET | `/api/public/products/{slug}` | `slug`, `locale` | 产品详情、media、specs、seo、buttons | Public | 测试多语言、PDF、主图 |
| GET | `/api/public/markets/{slug}` | `slug`, `locale` | 国家页内容、案例、FAQ、SEO | Public | 测试 Mexico/Algeria 页面 |
| GET | `/api/public/solutions/{slug}` | `slug`, `locale` | 解决方案内容、推荐产品 | Public | 测试推荐车型绑定 |
| GET | `/api/public/blogs` | `locale`, `type`, `page`, `pageSize` | 文章分页 | Public | 测试只返回已发布内容 |
| GET | `/api/public/blogs/{slug}` | `slug`, `locale` | 文章详情、SEO、相关文章 | Public | 测试 slug 和 locale 唯一 |
| POST | `/api/public/leads` | RFQ 表单 JSON + media ids | leadNo、status | Public + rate limit | 校验联系方式和国家；测试成功、缺字段、防刷 |
| POST | `/api/public/ai/chat` | `sessionKey`, `locale`, `message`, `context` | assistant message、tool results、lead info | Public + rate limit | 测试 RAG、工具调用、禁止报价 |
| GET | `/api/public/site-config` | `locale` | 联系方式、WhatsApp、语言、全局按钮 | Public | 测试全局配置 fallback |

### 12.3 后台 API

| Method | Endpoint | 请求参数 | 响应结构 | 权限 | 核心逻辑与测试方法 |
|--------|----------|----------|----------|------|--------------------|
| POST | `/api/admin/auth/login` | username、password | token、user、permissions | Public admin login | 测试密码错误、禁用用户 |
| GET | `/api/admin/users` | page、keyword、status | 用户分页 | `user:read` | 测试权限和分页 |
| POST | `/api/admin/users` | 用户表单、roleIds | user id | `user:write` | 测试用户名唯一和密码加密 |
| GET | `/api/admin/categories` | keyword、status | 分类树或分页 | `category:read` | 测试树结构 |
| POST | `/api/admin/categories` | code、slug、name、parentId、seo | category id | `category:write` | 测试 slug 唯一 |
| PUT | `/api/admin/categories/{id}` | 分类更新表单 | category | `category:write` | 测试启停和排序 |
| GET | `/api/admin/attributes` | categoryId | 参数定义列表 | `attribute:read` | 测试按分类过滤 |
| POST | `/api/admin/attributes` | 参数定义表单 | attribute id | `attribute:write` | 测试 options JSON 校验 |
| PUT | `/api/admin/attributes/{id}` | 参数定义更新 | attribute | `attribute:write` | 测试已使用参数更新限制 |
| GET | `/api/admin/products` | keyword、category、status、page | 产品分页 | `product:read` | 测试筛选 |
| POST | `/api/admin/products` | 产品基础、多语言、specs、media、seo | product id | `product:write` | 测试 specs 校验和草稿 |
| PUT | `/api/admin/products/{id}` | 产品更新表单 | product | `product:write` | 测试发布前校验 |
| DELETE | `/api/admin/products/{id}` | id | success | `product:delete` | 测试软删除 |
| POST | `/api/admin/media/upload` | multipart file、mediaType | media_asset | `media:write` | 测试类型、大小、MinIO key |
| GET | `/api/admin/media` | mediaType、keyword、page | 媒体分页 | `media:read` | 测试筛选和预览 URL |
| GET | `/api/admin/pages` | pageType、locale、status | 页面分页 | `page:read` | 测试 locale 查询 |
| POST | `/api/admin/pages` | 页面表单 | page id | `page:write` | 测试 slug + locale 唯一 |
| PUT | `/api/admin/pages/{id}` | 页面更新 | page | `page:write` | 测试发布状态 |
| GET | `/api/admin/page-blocks` | pageId、locale | block 列表 | `page:read` | 测试排序 |
| POST | `/api/admin/page-blocks` | blockType、config、sort | block id | `page:write` | 测试 block config schema |
| PUT | `/api/admin/page-blocks/{id}` | block 更新 | block | `page:write` | 测试隐藏和排序 |
| GET | `/api/admin/buttons` | placement、locale | 按钮列表 | `button:read` | 测试位置过滤 |
| POST | `/api/admin/buttons` | text、actionType、actionConfig | button id | `button:write` | 测试 action 白名单 |
| PUT | `/api/admin/buttons/{id}` | 按钮更新 | button | `button:write` | 测试 WhatsApp 模板 |
| GET | `/api/admin/leads` | status、country、assignedTo、date | 线索分页 | `lead:read` | 测试筛选和来源 |
| PUT | `/api/admin/leads/{id}/assign` | assignedTo | lead | `lead:assign` | 测试负责人存在 |
| PUT | `/api/admin/leads/{id}/status` | status | lead | `lead:write` | 测试状态枚举 |
| POST | `/api/admin/leads/{id}/follow-ups` | followType、content、nextActionAt | follow-up id | `lead:write` | 测试内容必填 |
| GET | `/api/admin/ai/knowledge` | status、sourceType、locale | 文档分页 | `ai:read` | 测试索引状态筛选 |
| POST | `/api/admin/ai/knowledge/index` | documentId 或 sourceType/sourceId | index job result | `ai:write` | 测试重复索引和 hash |
| GET | `/api/admin/ai/chat-sessions` | keyword、locale、hasLead | 会话分页 | `ai:read` | 测试关联 lead |

## 13. SEO Design

### 13.1 SEO 总体要求

每个可索引页面必须支持：

- `seo_title`
- `seo_description`
- `seo_keywords`
- `canonical_url`
- `og_title`
- `og_description`
- `og_image`
- `slug`
- `locale`

技术要求：

- 使用 Next.js metadata API。
- 产品页、分类页、国家页、博客页支持服务端渲染或静态生成。
- 多语言页面输出 hreflang。
- sitemap.xml 包含多语言 URL。
- robots.txt 放行核心页面，屏蔽后台和无价值参数页。
- canonical URL 避免重复收录。
- 图片必须有 alt 文本。
- FAQ、Product、Article、Breadcrumb 使用 Schema.org JSON-LD。

### 13.2 页面类型 SEO

| 页面 | SEO 重点 | 结构化数据 | 验收 |
|------|----------|------------|------|
| 产品详情页 | 产品名、车型、容量、应用、出口国家 | Product、Breadcrumb | title、description、JSON-LD 包含产品信息 |
| 产品分类页 | 分类关键词、用途、筛选入口 | CollectionPage、Breadcrumb | 分类 slug 可索引，筛选参数 canonical 正确 |
| 国家落地页 | 国家 + 产品 + 出口能力 | WebPage、FAQPage、Breadcrumb | Mexico/Algeria 页面输出 hreflang |
| 解决方案页 | 行业场景、推荐车型 | Article、Breadcrumb | 推荐产品链接可抓取 |
| 博客页 | 采购指南、出口指南长尾词 | Article | 发布时间、作者、摘要正确 |
| FAQ 页面 | 常见问题长尾词 | FAQPage | question/answer JSON-LD 正确 |
| 关于我们 | 工厂实力、出口经验、信任背书 | Organization | 公司信息和联系方式完整 |
| 联系我们 | RFQ、WhatsApp、邮箱 | ContactPage | 表单可提交，联系方式可见 |

### 13.3 hreflang

示例：

```html
<link rel="alternate" hreflang="en-US" href="https://example.com/en-US/products/fuel-tank-truck-10000l" />
<link rel="alternate" hreflang="es-MX" href="https://example.com/es-MX/products/camion-cisterna-10000l" />
<link rel="alternate" hreflang="fr-DZ" href="https://example.com/fr-DZ/products/camion-citerne-10000l" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en-US/products/fuel-tank-truck-10000l" />
```

### 13.4 sitemap.xml

必须包含：

- 首页。
- 产品分类页。
- 产品详情页。
- 国家落地页。
- 解决方案页。
- 案例页。
- 博客页。
- FAQ 页面。

规则：

- 只输出已发布页面。
- 每个 locale 单独 URL。
- lastmod 使用对应内容更新时间。
- 删除或下线内容不出现在 sitemap。

### 13.5 robots.txt

默认策略：

```text
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /*?preview=
Sitemap: https://example.com/sitemap.xml
```

### 13.6 Open Graph

每个页面输出：

- `og:title`
- `og:description`
- `og:image`
- `og:url`
- `og:type`
- `og:locale`

产品页默认 OG 图片使用产品主图。

### 13.7 图片 alt

规则：

- 产品主图 alt 包含产品名称、车型、关键参数。
- 案例图片 alt 包含国家、车型、应用场景。
- 装饰图片可空 alt，但产品和案例图片不可空。

### 13.8 SEO 测试方法

- 使用单元测试验证 metadata helper。
- 使用 Playwright 抓取页面 head。
- 验证 canonical、hreflang、OG、JSON-LD。
- 验证 sitemap 只包含 published 内容。
- 验证 robots 不暴露后台路径。
