#!/usr/bin/env node

/**
 * Skill Creator 测试
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const CLI_PATH = path.join(__dirname, '..', 'src', 'cli', 'skill-creator.js');

/**
 * 测试：列出模板
 */
function testListTemplates() {
  console.log('🧪 测试：列出模板');
  
  try {
    const output = execSync(`node "${CLI_PATH}" templates`, { encoding: 'utf-8' });
    
    assert(output.includes('可用技能模板'), '应包含模板列表标题');
    assert(output.includes('basic'), '应包含 basic 模板');
    assert(output.includes('api-integration'), '应包含 api-integration 模板');
    assert(output.includes('file-processor'), '应包含 file-processor 模板');
    assert(output.includes('web-scraper'), '应包含 web-scraper 模板');
    
    console.log('✅ 通过：模板列表正确\n');
    return true;
  } catch (error) {
    console.log('❌ 失败：', error.message, '\n');
    return false;
  }
}

/**
 * 测试：创建基础技能
 */
function testCreateBasicSkill() {
  console.log('🧪 测试：创建基础技能');
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
  const skillName = 'test-basic-skill';
  const outputDir = path.join(tempDir, skillName);
  
  try {
    execSync(`node "${CLI_PATH}" create "${skillName}" -t basic -o "${outputDir}" -d "测试技能"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // 验证文件创建
    assert(fs.existsSync(outputDir), '应创建技能目录');
    assert(fs.existsSync(path.join(outputDir, 'SKILL.md')), '应创建 SKILL.md');
    assert(fs.existsSync(path.join(outputDir, 'README.md')), '应创建 README.md');
    
    // 验证 SKILL.md 内容
    const skillMd = fs.readFileSync(path.join(outputDir, 'SKILL.md'), 'utf-8');
    assert(skillMd.includes('test-basic-skill'), 'SKILL.md 应包含技能名称');
    assert(skillMd.includes('测试技能'), 'SKILL.md 应包含描述');
    assert(skillMd.includes('Triggers'), 'SKILL.md 应包含触发条件部分');
    
    // basic 模板不应有 index.js
    assert(!fs.existsSync(path.join(outputDir, 'index.js')), 'basic 模板不应创建 index.js');
    
    console.log('✅ 通过：基础技能创建成功\n');
    
    // 清理
    fs.rmSync(tempDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.log('❌ 失败：', error.message);
    // 清理
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    return false;
  }
}

/**
 * 测试：创建 API 集成技能
 */
function testCreateApiSkill() {
  console.log('🧪 测试：创建 API 集成技能');
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
  const skillName = 'test-api-skill';
  const outputDir = path.join(tempDir, skillName);
  
  try {
    execSync(`node "${CLI_PATH}" create "${skillName}" -t api-integration -o "${outputDir}"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // 验证文件创建
    assert(fs.existsSync(path.join(outputDir, 'index.js')), 'api-integration 模板应创建 index.js');
    
    // 验证 index.js 内容
    const indexJs = fs.readFileSync(path.join(outputDir, 'index.js'), 'utf-8');
    assert(indexJs.includes('callApi'), 'index.js 应包含 callApi 函数');
    assert(indexJs.includes('maxRetries'), 'index.js 应包含重试逻辑');
    assert(indexJs.includes('fetch'), 'index.js 应使用 fetch API');
    
    console.log('✅ 通过：API 集成技能创建成功\n');
    
    // 清理
    fs.rmSync(tempDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.log('❌ 失败：', error.message);
    // 清理
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    return false;
  }
}

/**
 * 测试：创建文件处理技能
 */
function testCreateFileProcessorSkill() {
  console.log('🧪 测试：创建文件处理技能');
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-test-'));
  const skillName = 'test-file-processor';
  const outputDir = path.join(tempDir, skillName);
  
  try {
    execSync(`node "${CLI_PATH}" create "${skillName}" -t file-processor -o "${outputDir}"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const indexJs = fs.readFileSync(path.join(outputDir, 'index.js'), 'utf-8');
    assert(indexJs.includes('processFile'), 'index.js 应包含 processFile 函数');
    assert(indexJs.includes('validateFile'), 'index.js 应包含文件验证');
    assert(indexJs.includes('SUPPORTED_FORMATS'), 'index.js 应定义支持的格式');
    
    console.log('✅ 通过：文件处理技能创建成功\n');
    
    // 清理
    fs.rmSync(tempDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.log('❌ 失败：', error.message);
    // 清理
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    return false;
  }
}

/**
 * 测试：帮助信息
 */
function testHelp() {
  console.log('🧪 测试：帮助信息');
  
  try {
    const output = execSync(`node "${CLI_PATH}" --help`, { encoding: 'utf-8' });
    
    assert(output.includes('Skill Creator'), '应包含工具名称');
    assert(output.includes('create'), '应包含 create 命令');
    assert(output.includes('templates'), '应包含 templates 命令');
    
    console.log('✅ 通过：帮助信息正确\n');
    return true;
  } catch (error) {
    console.log('❌ 失败：', error.message, '\n');
    return false;
  }
}

/**
 * 运行所有测试
 */
function runTests() {
  console.log('=================================');
  console.log('  Skill Creator 测试套件');
  console.log('=================================\n');
  
  const results = [];
  
  results.push(testHelp());
  results.push(testListTemplates());
  results.push(testCreateBasicSkill());
  results.push(testCreateApiSkill());
  results.push(testCreateFileProcessorSkill());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('=================================');
  console.log(`  测试结果：${passed}/${total} 通过`);
  console.log('=================================\n');
  
  process.exit(passed === total ? 0 : 1);
}

runTests();
