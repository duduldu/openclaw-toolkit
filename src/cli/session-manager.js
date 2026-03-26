#!/usr/bin/env node

/**
 * Session Manager - OpenClaw 会话管理工具
 * 
 * 功能：
 * - 列出所有会话
 * - 查看会话详情
 * - 清理过期会话
 * - 导出会话记录
 */

const { program } = require('commander');
const { execSync } = require('child_process');

const version = '0.2.0';

program
  .name('session-manager')
  .description('OpenClaw 会话管理工具')
  .version(version);

/**
 * 调用 OpenClaw CLI 获取会话列表
 */
function getSessions(options = {}) {
  try {
    let cmd = 'openclaw sessions list';
    const args = [];
    
    if (options.active) args.push('--active');
    if (options.limit) args.push(`--limit ${options.limit}`);
    
    if (args.length > 0) {
      cmd += ' ' + args.join(' ');
    }
    
    const output = execSync(cmd, { encoding: 'utf-8' });
    return { success: true, data: output };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * 获取会话详情
 */
function getSessionInfo(sessionKey) {
  try {
    const output = execSync(`openclaw sessions history --session-key "${sessionKey}" --limit 5`, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, data: output };
  } catch (error) {
    // 如果没有历史记录，可能会话不存在或为空
    if (error.status === 0 || error.stdout) {
      return { success: true, data: error.stdout || '会话为空' };
    }
    return { 
      success: false, 
      error: `无法获取会话 "${sessionKey}" 的信息` 
    };
  }
}

/**
 * 格式化时间
 */
function formatTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * 解析会话列表输出
 */
function parseSessionsList(output) {
  // 尝试解析 JSON 输出或文本输出
  try {
    const json = JSON.parse(output);
    return json;
  } catch {
    // 返回原始文本
    return { raw: output };
  }
}

program
  .command('list')
  .description('列出所有会话')
  .option('-a, --active', '仅显示活跃会话')
  .option('-l, --limit <number>', '限制显示数量', '10')
  .option('--json', '以 JSON 格式输出')
  .action((options) => {
    console.log('📋 会话列表');
    console.log('============\n');
    
    const result = getSessions({
      active: options.active,
      limit: options.limit
    });
    
    if (!result.success) {
      console.log(`❌ 获取会话失败：${result.error}`);
      console.log('\n请确保 OpenClaw 已安装并可访问');
      return;
    }
    
    const data = parseSessionsList(result.data);
    
    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    
    if (data.raw) {
      // 文本输出，直接显示
      console.log(data.raw);
    } else if (Array.isArray(data.sessions)) {
      console.log(`共 ${data.sessions.length} 个会话\n`);
      console.log('SESSION_KEY'.padEnd(40) + 'STATUS'.padEnd(10) + 'LAST ACTIVE');
      console.log('-'.repeat(70));
      
      data.sessions.forEach(session => {
        const key = session.sessionKey || session.key || 'unknown';
        const status = session.status || 'active';
        const lastActive = formatTime(session.lastActive);
        
        console.log(
          key.substring(0, 38).padEnd(40) + 
          status.padEnd(10) + 
          lastActive
        );
      });
    } else {
      console.log('暂无会话数据');
    }
    
    console.log('');
  });

program
  .command('info <sessionId>')
  .description('查看会话详情')
  .option('--history', '显示最近消息历史')
  .action((sessionId, options) => {
    console.log(`📊 会话详情：${sessionId}`);
    console.log('========================\n');
    
    // 先尝试获取会话状态
    try {
      const statusCmd = `openclaw session_status --session-key "${sessionId}"`;
      const statusOutput = execSync(statusCmd, { encoding: 'utf-8' });
      console.log('状态信息:');
      console.log(statusOutput);
    } catch (error) {
      console.log('⚠️  无法获取会话状态（会话可能不存在或无权限）');
    }
    
    if (options.history) {
      console.log('\n最近消息历史:');
      console.log('------------------------\n');
      
      const result = getSessionInfo(sessionId);
      if (result.success) {
        console.log(result.data || '(无消息)');
      } else {
        console.log(result.error);
      }
    }
    
    console.log('');
  });

program
  .command('clean')
  .description('清理过期会话')
  .option('-d, --days <number>', '清理 N 天前的会话', '7')
  .option('--dry-run', '预览模式，不实际删除')
  .action((options) => {
    console.log(`🧹 清理会话`);
    console.log('============\n');
    console.log(`清理阈值：${options.days} 天前`);
    console.log(`预览模式：${options.dryRun ? '是' : '否'}`);
    console.log('');
    
    const days = parseInt(options.days);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    console.log(`截止时间：${cutoffDate.toLocaleString('zh-CN')}`);
    console.log('');
    
    // 获取会话列表
    const result = getSessions({ limit: 100 });
    if (!result.success) {
      console.log(`❌ 获取会话失败：${result.error}`);
      return;
    }
    
    console.log('⚠️  注意：当前版本不支持自动清理会话');
    console.log('   请手动使用 openclaw 命令管理会话');
    console.log('');
    console.log('[TODO] 实现会话清理逻辑需要 OpenClaw API 支持');
  });

program
  .command('export <sessionId>')
  .description('导出会话记录')
  .option('-f, --format <type>', '导出格式 (json|md|txt)', 'json')
  .option('-o, --output <path>', '输出文件路径')
  .action((sessionId, options) => {
    console.log(`📤 导出会话：${sessionId}`);
    console.log('========================\n');
    console.log(`格式：${options.format}`);
    console.log(`输出：${options.output || 'stdout'}`);
    console.log('');
    
    try {
      const cmd = `openclaw sessions history --session-key "${sessionId}" --limit 100 --include-tools`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      
      if (options.output) {
        const fs = require('fs');
        fs.writeFileSync(options.output, output);
        console.log(`✅ 已导出到：${options.output}`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.log(`❌ 导出失败：${error.message}`);
    }
    
    console.log('');
  });

program.parse();
