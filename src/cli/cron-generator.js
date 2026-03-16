#!/usr/bin/env node

/**
 * Cron Generator - Cron 表达式生成器
 * 
 * 功能：
 * - 自然语言转 Cron 表达式
 * - Cron 表达式解析
 * - 下次执行时间计算
 */

const { program } = require('commander');

const version = '0.1.0';

program
  .name('cron-generator')
  .description('Cron 表达式生成器')
  .version(version);

// Cron 字段说明
const CRON_FIELDS = {
  minute: { name: '分钟', range: '0-59' },
  hour: { name: '小时', range: '0-23' },
  day: { name: '日期', range: '1-31' },
  month: { name: '月份', range: '1-12' },
  weekday: { name: '星期', range: '0-6 (0=周日)' }
};

/**
 * 生成常见 Cron 表达式
 */
const PRESETS = {
  '每小时': '0 * * * *',
  '每天零点': '0 0 * * *',
  '每周一 9 点': '0 9 * * 1',
  '工作日 9 点': '0 9 * * 1-5',
  '每 5 分钟': '*/5 * * * *',
  '每 30 分钟': '*/30 * * * *',
  '每月 1 号': '0 0 1 * *',
  '每年 1 月 1 日': '0 0 1 1 *'
};

/**
 * 解析 Cron 表达式
 */
function parseCron(cronExpr) {
  const parts = cronExpr.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    return { error: 'Cron 表达式必须包含 5 个字段：分 时 日 月 周' };
  }
  
  const fields = ['minute', 'hour', 'day', 'month', 'weekday'];
  const result = {};
  
  fields.forEach((field, index) => {
    result[field] = {
      value: parts[index],
      desc: CRON_FIELDS[field].name
    };
  });
  
  return result;
}

/**
 * 计算下次执行时间
 */
function getNextRun(cronExpr, fromDate = new Date()) {
  // 简化实现 - 实际应该解析 cron 并计算
  const parts = cronExpr.trim().split(/\s+/);
  const now = fromDate;
  const next = new Date(now);
  
  // 简单处理：如果是 */N 格式，计算下次时间
  const minute = parts[0];
  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.slice(2));
    const currentMinute = now.getMinutes();
    const nextMinute = Math.ceil((currentMinute + 1) / interval) * interval;
    
    if (nextMinute >= 60) {
      next.setHours(next.getHours() + 1, 0, 0, 0);
    } else {
      next.setMinutes(nextMinute, 0, 0);
    }
  } else {
    // 固定时间
    const [min, hour] = parts;
    next.setHours(parseInt(hour || 0), parseInt(min || 0), 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  }
  
  return next;
}

/**
 * 生成自然语言描述
 */
function describeCron(cronExpr) {
  const parts = cronExpr.trim().split(/\s+/);
  const [min, hour, day, month, weekday] = parts;
  
  let desc = [];
  
  // 分钟
  if (min === '0') {
    desc.push('整点');
  } else if (min.startsWith('*/')) {
    desc.push(`每${min.slice(2)}分钟`);
  } else if (min.includes('/')) {
    desc.push(`第${min}分钟`);
  } else {
    desc.push(`${min}分`);
  }
  
  // 小时
  if (hour === '*') {
    desc.push('每小时');
  } else {
    desc.push(`${hour}点`);
  }
  
  // 星期
  if (weekday !== '*') {
    const weekdays = {
      '0': '周日', '1': '周一', '2': '周二', '3': '周三',
      '4': '周四', '5': '周五', '6': '周六'
    };
    if (weekday === '1-5') {
      desc.push('工作日');
    } else if (weekday.includes('-')) {
      const [start, end] = weekday.split('-').map(w => weekdays[w]);
      desc.push(`${start}到${end}`);
    } else {
      desc.push(weekdays[weekday] || weekday);
    }
  }
  
  // 日期
  if (day !== '*') {
    desc.push(`每月${day}号`);
  }
  
  // 月份
  if (month !== '*') {
    desc.push(`${month}月`);
  }
  
  return desc.join(' ');
}

// 子命令：预设列表
program
  .command('presets')
  .description('列出常用 Cron 预设')
  .action(() => {
    console.log('⏰ 常用 Cron 表达式预设');
    console.log('======================\n');
    
    Object.entries(PRESETS).forEach(([name, expr]) => {
      const desc = describeCron(expr);
      console.log(`  ${name.padEnd(12)} ${expr.padEnd(15)} (${desc})`);
    });
    
    console.log('\n使用：oc-toolkit cron generate <preset-name>');
  });

// 子命令：生成 Cron
program
  .command('generate <preset>')
  .description('根据预设生成 Cron 表达式')
  .action((preset) => {
    if (PRESETS[preset]) {
      console.log(`\n✅ ${preset}: ${PRESETS[preset]}\n`);
      console.log(`   描述：${describeCron(PRESETS[preset])}`);
      console.log(`   下次执行：${getNextRun(PRESETS[preset]).toLocaleString('zh-CN')}\n`);
    } else {
      console.log(`❌ 未找到预设 "${preset}"`);
      console.log('可用预设：', Object.keys(PRESETS).join(', '));
    }
  });

// 子命令：解析 Cron
program
  .command('parse <cron>')
  .description('解析 Cron 表达式')
  .action((cron) => {
    const parsed = parseCron(cron);
    
    if (parsed.error) {
      console.log(`❌ ${parsed.error}`);
      return;
    }
    
    console.log('\n📋 Cron 解析结果:\n');
    console.log(`表达式：${cron}`);
    console.log(`描述：${describeCron(cron)}`);
    console.log(`下次执行：${getNextRun(cron).toLocaleString('zh-CN')}\n`);
    console.log('字段详情:');
    
    Object.entries(parsed).forEach(([field, data]) => {
      console.log(`  ${data.desc.padEnd(8)} ${data.value}`);
    });
    console.log('');
  });

// 子命令：下次执行时间
program
  .command('next <cron>')
  .description('计算下次执行时间')
  .option('-n, --count <number>', '显示接下来 N 次', '5')
  .action((cron, options) => {
    const count = parseInt(options.count);
    const parsed = parseCron(cron);
    
    if (parsed.error) {
      console.log(`❌ ${parsed.error}`);
      return;
    }
    
    console.log(`\n📅 接下来 ${count} 次执行时间:\n`);
    
    let currentDate = new Date();
    for (let i = 0; i < count; i++) {
      const next = getNextRun(cron, currentDate);
      console.log(`  ${i + 1}. ${next.toLocaleString('zh-CN')}`);
      currentDate = new Date(next.getTime() + 60000); // +1 分钟避免重复
    }
    console.log('');
  });

program.parse();
