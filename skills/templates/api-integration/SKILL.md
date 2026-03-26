# API 集成 Skill 模板

用于集成外部 API 的技能，包含错误处理和重试逻辑。

## 文件结构

```
api-integration-skill/
├── SKILL.md
├── index.js
└── scripts/
    └── api-client.js
```

## 最佳实践

### 1. API Key 管理

```javascript
// 从环境变量或配置读取
const apiKey = process.env.API_KEY || config.apiKey;
```

### 2. 错误处理

```javascript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
} catch (error) {
  // 记录错误并返回友好提示
  console.error(`API 调用失败：${error.message}`);
  return { error: '服务暂时不可用' };
}
```

### 3. 重试逻辑

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // 指数退避
    }
  }
}
```

### 4. 速率限制

```javascript
// 添加请求间隔
const RATE_LIMIT_MS = 1000;
let lastRequest = 0;

async function rateLimitedRequest() {
  const now = Date.now();
  if (now - lastRequest < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - (now - lastRequest));
  }
  lastRequest = Date.now();
  // 执行请求...
}
```

## 示例技能

- `weather` - 天气 API 集成
- `web_search` - 搜索引擎 API
