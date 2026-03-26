#!/usr/bin/env node

/**
 * Session Manager 测试
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

console.log('🧪 Session Manager 测试\n');
console.log('========================\n');

let passed = 0;
let failed = 0;

// 测试 1: 帮助信息
if (runTest('显示帮助信息', () => {
  const output = execSync('node src/cli/session-manager.js --help', { encoding: 'utf-8' });
  assert(output.includes('会话管理'), '帮助信息应包含功能描述');
  passed++;
})) { passed++; } else { failed++; }

// 测试 2: list 命令帮助
if (runTest('list 子命令帮助', () => {
  const output = execSync('node src/cli/session-manager.js list --help', { encoding: 'utf-8' });
  assert(output.includes('列出所有会话'), '应显示 list 命令描述');
  passed++;
})) { passed++; } else { failed++; }

// 测试 3: info 命令帮助
if (runTest('info 子命令帮助', () => {
  const output = execSync('node src/cli/session-manager.js info --help', { encoding: 'utf-8' });
  assert(output.includes('查看会话详情'), '应显示 info 命令描述');
  passed++;
})) { passed++; } else { failed++; }

// 测试 4: clean 命令帮助
if (runTest('clean 子命令帮助', () => {
  const output = execSync('node src/cli/session-manager.js clean --help', { encoding: 'utf-8' });
  assert(output.includes('清理过期会话'), '应显示 clean 命令描述');
  passed++;
})) { passed++; } else { failed++; }

// 测试 5: export 命令帮助
if (runTest('export 子命令帮助', () => {
  const output = execSync('node src/cli/session-manager.js export --help', { encoding: 'utf-8' });
  assert(output.includes('导出会话记录'), '应显示 export 命令描述');
  passed++;
})) { passed++; } else { failed++; }

// 测试 6: 版本号
if (runTest('版本号显示', () => {
  const output = execSync('node src/cli/session-manager.js --version', { encoding: 'utf-8' });
  assert(output.includes('0.2.0'), '应显示正确版本号');
  passed++;
})) { passed++; } else { failed++; }

console.log('\n========================');
console.log(`测试结果：${passed} 通过，${failed} 失败`);

if (failed > 0) {
  process.exit(1);
}
