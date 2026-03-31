# 企业 API 集成模板

适用于企业内部 API 集成场景，包含认证、加密、重试等企业级特性。

## 适用场景

- 企业内部 REST API 调用
- 需要认证（API Key / OAuth / JWT）
- 需要处理加密文件
- 需要批量数据处理
- 需要审计日志

## 模板结构

```
enterprise-api-integration/
├── SKILL.md              # 技能描述
├── index.js              # 主逻辑
├── config.js             # 配置管理
├── api-client.js         # API 客户端封装
├── file-processor.js     # 文件处理工具
└── README.md             # 使用说明
```

## 核心功能

### 1. API 客户端封装

```javascript
// api-client.js
const https = require('https');

class EnterpriseApiClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
  }

  async request(endpoint, options = {}) {
    const url = new URL(endpoint, this.baseUrl);
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
          },
          timeout: this.timeout
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw error;
        }
        // 指数退避重试
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  async uploadFile(endpoint, filePath) {
    const fs = require('fs');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    return this.request(endpoint, {
      method: 'POST',
      body: form
    });
  }
}

module.exports = EnterpriseApiClient;
```

### 2. 配置管理

```javascript
// config.js
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.env.APPDATA || process.env.HOME, '.openclaw', 'enterprise-config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (error) {
    console.error('加载配置失败:', error.message);
  }
  
  return {
    baseUrl: process.env.API_BASE_URL || '',
    apiKey: process.env.API_KEY || '',
    timeout: 30000,
    maxRetries: 3
  };
}

function saveConfig(config) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

module.exports = { loadConfig, saveConfig, CONFIG_PATH };
```

### 3. 文件处理器

```javascript
// file-processor.js
const fs = require('fs');
const path = require('path');

class FileProcessor {
  constructor(options = {}) {
    this.tempDir = options.tempDir || path.join(process.cwd(), 'temp');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
  }

  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error('文件不存在');
    }
    
    const stats = fs.statSync(filePath);
    if (stats.size > this.maxFileSize) {
      throw new Error(`文件过大（最大 ${this.maxFileSize / 1024 / 1024}MB）`);
    }
    
    return { valid: true, size: stats.size, ext: path.extname(filePath) };
  }

  async processExcel(filePath) {
    const pandas = require('pandas');
    const df = await pandas.read_excel(filePath);
    return df.to_records();
  }

  async processJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  async processCsv(filePath) {
    const pandas = require('pandas');
    const df = await pandas.read_csv(filePath);
    return df.to_records();
  }

  createTempFile(content, extension = '.tmp') {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    
    const filename = `temp_${Date.now()}${extension}`;
    const filePath = path.join(this.tempDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  cleanupTempFiles() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
}

module.exports = FileProcessor;
```

## 使用示例

### 示例 1: 调用企业 API

```javascript
const EnterpriseApiClient = require('./api-client');
const { loadConfig } = require('./config');

async function main() {
  const config = loadConfig();
  const client = new EnterpriseApiClient(config);
  
  try {
    const data = await client.request('/api/v1/data', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' })
    });
    console.log('API 响应:', data);
  } catch (error) {
    console.error('API 调用失败:', error.message);
  }
}

main();
```

### 示例 2: 处理加密文件

```javascript
const EnterpriseApiClient = require('./api-client');
const FileProcessor = require('./file-processor');
const { loadConfig } = require('./config');

async function processEncryptedFile(encryptedPath) {
  const config = loadConfig();
  const client = new EnterpriseApiClient(config);
  const processor = new FileProcessor();
  
  try {
    // 1. 上传解密
    const decryptResult = await client.uploadFile('/api/decrypt', encryptedPath);
    
    // 2. 下载解密文件
    const decryptedPath = processor.createTempFile(decryptResult.data);
    
    // 3. 处理文件
    const data = await processor.processExcel(decryptedPath);
    
    // 4. 清理临时文件
    processor.cleanupTempFiles();
    
    return data;
  } catch (error) {
    processor.cleanupTempFiles();
    throw error;
  }
}
```

## 安全注意事项

1. **API 密钥** - 不要硬编码在代码中，使用环境变量或配置文件
2. **临时文件** - 处理完成后及时清理，避免敏感数据泄露
3. **日志** - 不要记录敏感信息（API 密钥、个人数据等）
4. **HTTPS** - 始终使用 HTTPS 连接
5. **超时** - 设置合理的超时时间，避免长时间阻塞

## 依赖安装

```bash
# 基础依赖
npm install form-data

# Python 依赖（用于文件处理）
pip install pandas openpyxl
```

## 扩展建议

- 添加请求签名（HMAC）
- 添加响应缓存
- 添加限流控制
- 添加详细的审计日志
- 支持 Webhook 回调
