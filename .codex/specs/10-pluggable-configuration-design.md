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

