#!/usr/bin/env node

/**
 * OpenClaw Toolkit CLI 入口
 */

const { program } = require('commander');

program
  .name('oc-toolkit')
  .description('OpenClaw 开发者工具箱')
  .version('0.1.0');

// 子命令
program
  .command('session')
  .description('会话管理')
  .argument('[command]', '子命令 (list|info|clean|export)')
  .argument('[args...]', '参数')
  .action((command, args) => {
    if (!command) {
      console.log('使用：oc-toolkit session <command> [args]');
      console.log('');
      console.log('可用命令:');
      console.log('  list     列出所有会话');
      console.log('  info     查看会话详情');
      console.log('  clean    清理过期会话');
      console.log('  export   导出会话记录');
      return;
    }
    
    // 调用对应的模块
    const { spawn } = require('child_process');
    const sub = spawn('node', [require('path').join(__dirname, 'session-manager.js'), command, ...args], {
      stdio: 'inherit'
    });
    
    sub.on('close', (code) => {
      process.exit(code);
    });
  });

program
  .command('cron')
  .description('Cron 任务生成器')
  .argument('[command]', '子命令 (presets|generate|parse|next)')
  .argument('[args...]', '参数')
  .action((command, args) => {
    if (!command) {
      console.log('使用：oc-toolkit cron <command> [args]');
      console.log('');
      console.log('可用命令:');
      console.log('  presets           列出常用预设');
      console.log('  generate <name>   生成 Cron 表达式');
      console.log('  parse <expr>      解析 Cron 表达式');
      console.log('  next <expr>       计算下次执行时间');
      return;
    }
    
    // 调用 cron-generator 模块
    const { spawn } = require('child_process');
    const sub = spawn('node', [require('path').join(__dirname, 'cron-generator.js'), command, ...args], {
      stdio: 'inherit'
    });
    
    sub.on('close', (code) => {
      process.exit(code);
    });
  });

program
  .command('config')
  .description('配置文件检查')
  .action(() => {
    console.log('⚙️ 配置检查');
    console.log('============');
    console.log('[TODO] 实现配置文件验证');
    console.log('');
    console.log('功能规划:');
    console.log('  - openclaw.json 语法检查');
    console.log('  - 必填字段验证');
    console.log('  - 推荐配置提示');
  });

program
  .command('skill')
  .description('技能模板生成')
  .action(() => {
    console.log('🛠️ 技能生成器');
    console.log('==============');
    console.log('[TODO] 实现 Skill 模板生成');
    console.log('');
    console.log('功能规划:');
    console.log('  - 交互式创建 Skill');
    console.log('  - 模板选择');
    console.log('  - 自动填充骨架代码');
  });

program.parse();
