#!/usr/bin/env node

/**
 * Skill Creator - 技能模板生成器
 * 
 * 功能：
 * - 交互式创建新技能
 * - 选择模板
 * - 自动填充骨架代码
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const version = '0.1.0';

program
  .name('skill-creator')
  .description('OpenClaw 技能模板生成器')
  .version(version);

/**
 * 可用模板列表
 */
const TEMPLATES = {
  basic: {
    name: '基础模板',
    description: '最简单的 Skill 结构，适合单一功能',
    files: ['SKILL.md']
  },
  'api-integration': {
    name: 'API 集成模板',
    description: '用于集成外部 API，包含错误处理和重试逻辑',
    files: ['SKILL.md', 'index.js']
  },
  'scheduled-task': {
    name: '定时任务模板',
    description: '用于创建 cron 定时任务',
    files: ['SKILL.md']
  },
  'file-processor': {
    name: '文件处理模板',
    description: '处理文件的技能，支持多种格式',
    files: ['SKILL.md', 'index.js']
  },
  'web-scraper': {
    name: '网页抓取模板',
    description: '抓取网页内容的技能',
    files: ['SKILL.md', 'index.js']
  }
};

/**
 * 创建交互式问答
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * 提问并获取用户输入
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 生成 SKILL.md 内容
 */
function generateSkillMd(template, skillName, description, triggers) {
  const templates = {
    basic: `# ${skillName}

${description || '技能描述'}

## Triggers

${triggers || '- When user asks about X\n- Keywords: keyword1, keyword2'}

## Behavior

1. Step one
2. Step two
3. Step three

## Notes

Any additional context or constraints.
`,
    'api-integration': `# ${skillName}

${description || '外部 API 集成技能'}

## Triggers

${triggers || '- When user requests data from API\n- Keywords: api, fetch, get'}

## Configuration

Required environment variables or config fields:
- \`API_KEY\` - API 密钥
- \`API_BASE_URL\` - API 基础地址

## Behavior

1. Validate input parameters
2. Call external API with retry logic
3. Handle errors gracefully
4. Return formatted response

## Error Handling

- Network errors: retry up to 3 times
- Authentication errors: prompt user to check API key
- Rate limits: respect Retry-After header

## Notes

- API rate limit: 100 requests/minute
- Timeout: 30 seconds
`,
    'scheduled-task': `# ${skillName}

${description || '定时任务技能'}

## Triggers

${triggers || '- Scheduled via cron job\n- Manual trigger: "run <task-name>"'}

## Schedule

Recommended cron expressions:
- Daily at 9 AM: \`0 9 * * *\`
- Every hour: \`0 * * * *\`
- Weekdays only: \`0 9 * * 1-5\`

## Behavior

1. Check if conditions are met
2. Execute scheduled task
3. Log results
4. Send notification if needed

## Notes

- Ensure timezone is configured correctly
- Task should be idempotent
`,
    'file-processor': `# ${skillName}

${description || '文件处理技能'}

## Triggers

${triggers || '- When user uploads a file\n- Keywords: process, convert, analyze'}

## Supported Formats

- Input: .xlsx, .csv, .json, .txt
- Output: configurable

## Behavior

1. Validate file format
2. Parse file content
3. Process/transform data
4. Generate output file

## Error Handling

- Invalid format: return clear error message
- Large files: warn about processing time
- Encoding issues: attempt auto-detection

## Notes

- Max file size: 10MB
- Temporary files are cleaned up after processing
`,
    'web-scraper': `# ${skillName}

${description || '网页抓取技能'}

## Triggers

${triggers || '- When user asks to fetch webpage content\n- Keywords: scrape, fetch, extract'}

## Configuration

- \`USER_AGENT\` - Custom user agent string (optional)
- \`TIMEOUT_MS\` - Request timeout in milliseconds (default: 10000)

## Behavior

1. Validate URL
2. Fetch page content
3. Extract relevant data
4. Return structured result

## Error Handling

- Network errors: retry with backoff
- Timeout: return partial content if available
- Anti-bot measures: respect robots.txt

## Notes

- Respect website terms of service
- Rate limit: 1 request per 2 seconds
- Cache results when appropriate
`
  };

  return templates[template] || templates.basic;
}

/**
 * 生成 index.js 内容
 */
function generateIndexJs(template, skillName) {
  const templates = {
    'api-integration': `#!/usr/bin/env node

/**
 * ${skillName} - API 集成
 */

const https = require('https');

const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: 30000,
  maxRetries: 3
};

/**
 * 调用 API
 */
async function callApi(endpoint, options = {}) {
  const url = new URL(endpoint, CONFIG.baseUrl);
  
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        ...options,
        timeout: CONFIG.timeout
      });
      
      if (!response.ok) {
        throw new Error(\`API error: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === CONFIG.maxRetries) {
        throw error;
      }
      // 等待后重试
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

module.exports = { callApi, CONFIG };
`,
    'file-processor': `#!/usr/bin/env node

/**
 * ${skillName} - 文件处理器
 */

const fs = require('fs');
const path = require('path');

const SUPPORTED_FORMATS = ['.xlsx', '.csv', '.json', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 验证文件
 */
function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('文件不存在');
  }
  
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error('文件过大（最大 10MB）');
  }
  
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) {
    throw new Error(\`不支持的文件格式：\${ext}\`);
  }
  
  return { valid: true, ext, size: stats.size };
}

/**
 * 处理文件
 */
async function processFile(filePath, options = {}) {
  const validation = validateFile(filePath);
  
  // 根据格式处理
  switch (validation.ext) {
    case '.json':
      return processJson(filePath);
    case '.csv':
      return processCsv(filePath);
    case '.txt':
      return processTxt(filePath);
    case '.xlsx':
      return processXlsx(filePath);
    default:
      throw new Error('未实现的格式处理器');
  }
}

function processJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function processCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\\n');
  return lines.map(line => line.split(','));
}

function processTxt(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function processXlsx(filePath) {
  // TODO: 使用 xlsx 库处理
  throw new Error('xlsx 处理需要安装 xlsx 库');
}

module.exports = { processFile, validateFile, SUPPORTED_FORMATS };
`,
    'web-scraper': `#!/usr/bin/env node

/**
 * ${skillName} - 网页抓取
 */

const https = require('https');
const http = require('http');

const CONFIG = {
  timeout: parseInt(process.env.TIMEOUT_MS) || 10000,
  userAgent: process.env.USER_AGENT || 'OpenClaw-Skill/1.0'
};

/**
 * 抓取网页
 */
async function scrapeUrl(url, options = {}) {
  const urlObj = new URL(url);
  
  // 验证 URL
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    throw new Error('只支持 HTTP/HTTPS 协议');
  }
  
  return new Promise((resolve, reject) => {
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const request = lib.get(url, {
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: CONFIG.timeout,
      ...options
    }, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        });
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 提取文本内容（简化版）
 */
function extractText(html) {
  return html
    .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\s+/g, ' ')
    .trim();
}

module.exports = { scrapeUrl, extractText, CONFIG };
`
  };

  return templates[template] || '';
}

/**
 * 创建技能目录
 */
async function createSkill(skillName, template, options) {
  const rl = createInterface();
  
  console.log('\\n🛠️  技能生成器');
  console.log('================\\n');
  
  // 如果命令行没有提供模板，交互式选择
  if (!template) {
    console.log('可用模板:\\n');
    Object.entries(TEMPLATES).forEach(([key, t], index) => {
      console.log(`  ${index + 1}. ${key.padEnd(20)} - ${t.description}`);
    });
    console.log('');
    
    const choice = await askQuestion(rl, '选择模板 (输入编号或名称): ');
    
    // 解析选择
    const choiceNum = parseInt(choice);
    if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= Object.keys(TEMPLATES).length) {
      template = Object.keys(TEMPLATES)[choiceNum - 1];
    } else if (TEMPLATES[choice]) {
      template = choice;
    } else {
      template = 'basic';
      console.log(`未识别，使用默认模板：basic`);
    }
  }
  
  // 确认模板
  const templateInfo = TEMPLATES[template];
  if (!templateInfo) {
    console.log(`❌ 未找到模板：${template}`);
    rl.close();
    return;
  }
  
  console.log(`\\n✅ 选择模板：${templateInfo.name}`);
  console.log(`   ${templateInfo.description}\\n`);
  
  // 确定输出目录
  const outputDir = options.output || path.join(process.cwd(), skillName);
  
  console.log(`📁 输出目录：${outputDir}\\n`);
  
  // 创建目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ 创建目录：${outputDir}`);
  }
  
  // 生成文件
  console.log('\\n📝 生成文件:');
  
  // SKILL.md
  const skillMdPath = path.join(outputDir, 'SKILL.md');
  const skillMdContent = generateSkillMd(template, skillName, options.description, options.triggers);
  fs.writeFileSync(skillMdPath, skillMdContent);
  console.log(`   ✅ SKILL.md`);
  
  // index.js (如果模板需要)
  if (templateInfo.files.includes('index.js')) {
    const indexPath = path.join(outputDir, 'index.js');
    const indexContent = generateIndexJs(template, skillName);
    fs.writeFileSync(indexPath, indexContent);
    console.log(`   ✅ index.js`);
  }
  
  // README.md
  const readmePath = path.join(outputDir, 'README.md');
  const readmeContent = `# ${skillName}

生成的技能目录。

## 文件结构

\`\`\`
${skillName}/
├── SKILL.md        # 技能描述
${templateInfo.files.includes('index.js') ? '├── index.js        # 技能主逻辑\\n' : ''}└── README.md       # 本文件
\`\`\`

## 安装

将本目录移动到 OpenClaw skills 目录：

\`\`\`bash
# Windows
xcopy /E /I "${outputDir}" "%USERPROFILE%\\.openclaw\\workspace\\skills\\${skillName}"

# Linux/Mac
cp -r "${outputDir}" ~/.openclaw/workspace/skills/${skillName}
\`\`\`

## 使用

技能安装后会自动加载，根据 SKILL.md 中的触发条件激活。

## 自定义

编辑 \`SKILL.md\` 修改触发条件和行为描述。
`;
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`   ✅ README.md`);
  
  console.log('\\n================');
  console.log(`✅ 技能 "${skillName}" 创建完成！`);
  console.log(`\\n下一步:`);
  console.log(`  1. 编辑 SKILL.md 自定义触发条件和行为`);
  console.log(`  2. 将目录移动到 OpenClaw skills 目录`);
  console.log(`  3. 重启 OpenClaw Gateway 或发送 reload 事件`);
  console.log('');
  
  rl.close();
}

// 子命令：创建技能
program
  .command('create <name>')
  .description('创建新技能')
  .option('-t, --template <name>', '使用指定模板')
  .option('-o, --output <path>', '输出目录路径')
  .option('-d, --description <text>', '技能描述')
  .option('--triggers <text>', '触发条件（多行用\\\\n 分隔）')
  .action(async (name, options) => {
    await createSkill(name, options.template, options);
  });

// 子命令：列出模板
program
  .command('templates')
  .description('列出可用模板')
  .action(() => {
    console.log('\\n📦 可用技能模板\\n');
    console.log('================\\n');
    
    Object.entries(TEMPLATES).forEach(([key, template]) => {
      console.log(`${key.padEnd(20)} ${template.name}`);
      console.log(' '.repeat(20) + `   ${template.description}`);
      console.log(' '.repeat(20) + `   文件：${template.files.join(', ')}`);
      console.log('');
    });
    
    console.log('使用：oc-toolkit skill create <name> -t <template>');
    console.log('');
  });

program.parse();

// 支持直接运行
if (require.main === module && !process.argv.slice(2).length) {
  program.outputHelp();
}
