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

