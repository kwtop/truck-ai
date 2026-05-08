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
