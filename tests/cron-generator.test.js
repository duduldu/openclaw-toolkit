#!/usr/bin/env node

/**
 * Cron Generator 测试
 */

const { execSync } = require('child_process');
const assert = require('assert');

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   错误：${error.message}`);
    return false;
  }
}

console.log('🧪 Cron Generator 测试\n');
console.log('========================\n');

let passed = 0;
let failed = 0;

// 测试 1: 帮助信息
if (runTest('显示帮助信息', () => {
  const output = execSync('node src/cli/cron-generator.js --help', { encoding: 'utf-8' });
  assert(output.includes('Cron 表达式生成器'), '帮助信息应包含功能描述');
})) { passed++; } else { failed++; }

// 测试 2: presets 命令
if (runTest('presets 预设列表', () => {
  const output = execSync('node src/cli/cron-generator.js presets', { encoding: 'utf-8' });
  assert(output.includes('常用 Cron 表达式预设'), '应显示预设列表标题');
  assert(output.includes('每小时'), '应包含每小时预设');
  assert(output.includes('每天零点'), '应包含每天零点预设');
})) { passed++; } else { failed++; }

// 测试 3: generate 命令
if (runTest('generate 生成 Cron', () => {
  const output = execSync('node src/cli/cron-generator.js generate "每小时"', { encoding: 'utf-8' });
  assert(output.includes('0 * * * *'), '应生成正确的 Cron 表达式');
})) { passed++; } else { failed++; }

// 测试 4: parse 命令
if (runTest('parse 解析 Cron', () => {
  const output = execSync('node src/cli/cron-generator.js parse "0 9 * * 1"', { encoding: 'utf-8' });
  assert(output.includes('Cron 解析结果'), '应显示解析结果');
  assert(output.includes('周一') || output.includes('星期'), '应包含星期信息');
})) { passed++; } else { failed++; }

// 测试 5: next 命令
if (runTest('next 计算下次执行', () => {
  const output = execSync('node src/cli/cron-generator.js next "0 9 * * *"', { encoding: 'utf-8' });
  assert(output.includes('执行时间'), '应显示执行时间');
})) { passed++; } else { failed++; }

// 测试 6: next 命令 - 多次执行
if (runTest('next 显示多次执行', () => {
  const output = execSync('node src/cli/cron-generator.js next "*/5 * * * *" -n 3', { encoding: 'utf-8' });
  assert(output.includes('接下来 3 次'), '应显示指定次数的执行时间');
})) { passed++; } else { failed++; }

// 测试 7: 版本号
if (runTest('版本号显示', () => {
  const output = execSync('node src/cli/cron-generator.js --version', { encoding: 'utf-8' });
  assert(output.includes('0.1.0'), '应显示正确版本号');
})) { passed++; } else { failed++; }

console.log('\n========================');
console.log(`测试结果：${passed} 通过，${failed} 失败`);

if (failed > 0) {
  process.exit(1);
}
