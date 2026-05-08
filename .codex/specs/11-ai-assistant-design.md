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

