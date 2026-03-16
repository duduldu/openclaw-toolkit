#!/usr/bin/env node

/**
 * Config Checker - OpenClaw 配置文件检查工具
 * 
 * 功能：
 * - openclaw.json 语法检查
 * - 必填字段验证
 * - 推荐配置提示
 * - 安全配置审计
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

const version = '0.1.0';

program
  .name('config-checker')
  .description('OpenClaw 配置文件检查工具')
  .version(version);

/**
 * OpenClaw 配置字段定义
 */
const CONFIG_SCHEMA = {
  // 必填字段
  required: [
    'plugins',
    'plugins.entries'
  ],
  
  // 推荐字段
  recommended: [
    'gateway.bind',
    'gateway.remote.url',
    'plugins.entries.cron',
    'plugins.entries.browser',
    'plugins.entries.device-pair'
  ],
  
  // 安全相关字段
  security: [
    'gateway.bind',
    'gateway.remote.url',
    'plugins.entries.device-pair.config.publicUrl'
  ]
};

/**
 * 检查配置文件是否存在
 */
function findConfigFile(dir) {
  const candidates = [
    'openclaw.json',
    'openclaw.config.json',
    '.openclaw/config.json',
    'config/openclaw.json'
  ];
  
  for (const candidate of candidates) {
    const fullPath = path.join(dir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}

/**
 * 验证 JSON 语法
 */
function validateJsonSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const config = JSON.parse(content);
    return { valid: true, config, content };
  } catch (error) {
    return {
      valid: false,
      error: `JSON 语法错误：${error.message}`
    };
  }
}

/**
 * 检查必填字段
 */
function checkRequiredFields(config) {
  const missing = [];
  
  for (const field of CONFIG_SCHEMA.required) {
    const parts = field.split('.');
    let obj = config;
    let exists = true;
    
    for (const part of parts) {
      if (obj && typeof obj === 'object' && part in obj) {
        obj = obj[part];
      } else {
        exists = false;
        break;
      }
    }
    
    if (!exists) {
      missing.push(field);
    }
  }
  
  return missing;
}

/**
 * 检查推荐字段
 */
function checkRecommendedFields(config) {
  const missing = [];
  
  for (const field of CONFIG_SCHEMA.recommended) {
    const parts = field.split('.');
    let obj = config;
    let exists = true;
    
    for (const part of parts) {
      if (obj && typeof obj === 'object' && part in obj) {
        obj = obj[part];
      } else {
        exists = false;
        break;
      }
    }
    
    if (!exists) {
      missing.push(field);
    }
  }
  
  return missing;
}

/**
 * 安全检查
 */
function securityAudit(config) {
  const issues = [];
  
  // 检查 gateway.bind
  if (config.gateway && config.gateway.bind) {
    const bind = config.gateway.bind;
    if (bind === '0.0.0.0') {
      issues.push({
        level: 'warning',
        field: 'gateway.bind',
        message: '绑定到 0.0.0.0 会暴露所有网络接口，建议绑定到特定 IP 或 127.0.0.1'
      });
    }
  }
  
  // 检查 remote.url
  if (config.gateway && config.gateway.remote && config.gateway.remote.url) {
    const url = config.gateway.remote.url;
    if (!url.startsWith('https://')) {
      issues.push({
        level: 'error',
        field: 'gateway.remote.url',
        message: '远程 URL 必须使用 HTTPS，当前配置不安全'
      });
    }
  }
  
  // 检查 device-pair publicUrl
  if (config.plugins && config.plugins.entries && config.plugins.entries['device-pair']) {
    const devicePair = config.plugins.entries['device-pair'];
    if (devicePair.config && devicePair.config.publicUrl) {
      const publicUrl = devicePair.config.publicUrl;
      if (!publicUrl.startsWith('https://')) {
        issues.push({
          level: 'error',
          field: 'plugins.entries.device-pair.config.publicUrl',
          message: '配对功能 publicUrl 必须使用 HTTPS'
        });
      }
    }
  }
  
  // 检查是否有敏感的明文密码
  const configStr = JSON.stringify(config);
  const sensitivePatterns = [
    { pattern: /password\s*:\s*"[^"]+"/i, field: 'password' },
    { pattern: /secret\s*:\s*"[^"]+"/i, field: 'secret' },
    { pattern: /token\s*:\s*"[^"]+"/i, field: 'token' }
  ];
  
  for (const { pattern, field } of sensitivePatterns) {
    if (pattern.test(configStr)) {
      issues.push({
        level: 'warning',
        field,
        message: `检测到可能的明文${field}，建议使用环境变量`
      });
    }
  }
  
  return issues;
}

/**
 * 生成配置建议
 */
function generateSuggestions(config) {
  const suggestions = [];
  
  // 如果没有配置 cron，建议使用
  if (!config.plugins || !config.plugins.entries || !config.plugins.entries.cron) {
    suggestions.push('建议启用 cron 插件以支持定时任务功能');
  }
  
  // 如果没有配置 browser，建议使用
  if (!config.plugins || !config.plugins.entries || !config.plugins.entries.browser) {
    suggestions.push('建议启用 browser 插件以支持浏览器控制功能');
  }
  
  // 检查是否使用最新配置格式
  if (config.plugins && !config.plugins.entries) {
    suggestions.push('配置格式可能过时，建议使用 plugins.entries 结构');
  }
  
  return suggestions;
}

// 子命令：检查配置
program
  .command('check [path]')
  .description('检查配置文件')
  .option('-v, --verbose', '显示详细信息')
  .option('--strict', '严格模式（推荐字段缺失也会报错）')
  .action((configPath, options) => {
    console.log('⚙️  OpenClaw 配置检查器');
    console.log('========================\n');
    
    // 查找配置文件
    if (!configPath) {
      configPath = findConfigFile(process.cwd());
      if (!configPath) {
        console.log('❌ 未找到配置文件');
        console.log('');
        console.log('支持的文件位置:');
        console.log('  - openclaw.json');
        console.log('  - openclaw.config.json');
        console.log('  - .openclaw/config.json');
        console.log('  - config/openclaw.json');
        return;
      }
    }
    
    console.log(`配置文件：${configPath}\n`);
    
    // 检查文件是否存在
    if (!fs.existsSync(configPath)) {
      console.log(`❌ 文件不存在：${configPath}`);
      return;
    }
    
    // 验证 JSON 语法
    const syntaxResult = validateJsonSyntax(configPath);
    if (!syntaxResult.valid) {
      console.log(`❌ ${syntaxResult.error}`);
      return;
    }
    
    console.log('✅ JSON 语法正确\n');
    
    const { config } = syntaxResult;
    let hasError = false;
    
    // 检查必填字段
    const missingRequired = checkRequiredFields(config);
    if (missingRequired.length > 0) {
      console.log('❌ 缺少必填字段:');
      missingRequired.forEach(field => console.log(`   - ${field}`));
      console.log('');
      hasError = true;
    } else {
      console.log('✅ 必填字段完整\n');
    }
    
    // 检查推荐字段
    const missingRecommended = checkRecommendedFields(config);
    if (missingRecommended.length > 0) {
      if (options.strict) {
        console.log('❌ 缺少推荐字段 (严格模式):');
        missingRecommended.forEach(field => console.log(`   - ${field}`));
        console.log('');
        hasError = true;
      } else {
        console.log('⚠️  缺少推荐字段:');
        missingRecommended.forEach(field => console.log(`   - ${field}`));
        console.log('');
      }
    } else {
      console.log('✅ 推荐字段完整\n');
    }
    
    // 安全检查
    const securityIssues = securityAudit(config);
    if (securityIssues.length > 0) {
      console.log('🔒 安全审计:');
      securityIssues.forEach(issue => {
        const icon = issue.level === 'error' ? '❌' : '⚠️';
        console.log(`   ${icon} [${issue.level}] ${issue.field}`);
        console.log(`      ${issue.message}`);
      });
      console.log('');
      
      if (securityIssues.some(i => i.level === 'error')) {
        hasError = true;
      }
    } else {
      console.log('🔒 安全审计：通过\n');
    }
    
    // 配置建议
    const suggestions = generateSuggestions(config);
    if (suggestions.length > 0) {
      console.log('💡 建议:');
      suggestions.forEach(s => console.log(`   - ${s}`));
      console.log('');
    }
    
    // 详细信息
    if (options.verbose) {
      console.log('📊 配置统计:');
      console.log(`   总字段数：${Object.keys(config).length}`);
      console.log(`   插件数：${config.plugins?.entries ? Object.keys(config.plugins.entries).length : 0}`);
      console.log('');
    }
    
    // 总结
    console.log('========================');
    if (hasError) {
      console.log('❌ 检查未通过，请修复上述问题');
      process.exit(1);
    } else {
      console.log('✅ 配置检查通过');
    }
  });

// 子命令：生成示例配置
program
  .command('init')
  .description('生成示例配置文件')
  .option('-o, --output <path>', '输出文件路径', 'openclaw.json.sample')
  .action((options) => {
    const sampleConfig = {
      gateway: {
        bind: '127.0.0.1',
        port: 18792,
        remote: {
          url: 'https://your-domain.com'
        }
      },
      plugins: {
        entries: {
          cron: {},
          browser: {},
          'device-pair': {
            config: {
              publicUrl: 'https://your-domain.com'
            }
          },
          webchat: {}
        }
      }
    };
    
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, JSON.stringify(sampleConfig, null, 2));
    
    console.log('✅ 示例配置文件已生成');
    console.log(`   路径：${outputPath}`);
    console.log('');
    console.log('请根据实际情况修改配置，特别是:');
    console.log('  - gateway.remote.url');
    console.log('  - plugins.entries.device-pair.config.publicUrl');
  });

// 子命令：验证字段
program
  .command('validate <field> <value>')
  .description('验证单个字段值')
  .action((field, value) => {
    console.log(`🔍 验证字段：${field}`);
    console.log(`   值：${value}`);
    console.log('');
    
    // 简单验证
    if (field.includes('url') || field.includes('Url')) {
      if (value.startsWith('http://')) {
        console.log('⚠️  警告：建议使用 HTTPS 而不是 HTTP');
      } else if (value.startsWith('https://')) {
        console.log('✅ URL 格式正确');
      } else {
        console.log('❌ URL 格式错误，应以 http:// 或 https:// 开头');
      }
    } else if (field.includes('bind')) {
      if (value === '0.0.0.0') {
        console.log('⚠️  警告：绑定到所有网络接口，可能有安全风险');
      } else if (value === '127.0.0.1' || value === 'localhost') {
        console.log('✅ 本地绑定，安全');
      } else {
        console.log('✅ 绑定地址格式正确');
      }
    } else {
      console.log('✅ 字段值格式正确');
    }
  });

program.parse();
