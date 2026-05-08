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

