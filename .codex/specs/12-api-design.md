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

