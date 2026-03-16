# OpenClaw Toolkit 🐙

OpenClaw 开发者工具箱 - 提升你的 OpenClaw 开发体验

## 📦 功能模块

### CLI 工具
- **session-manager** - 会话管理工具（list/info/clean/export）
- **cron-generator** - Cron 任务生成器（presets/generate/parse/next）
- **config-checker** - 配置文件检查工具（check/init/validate）

### Skills 模板
- **skill-creator** - 技能生成器
- **templates** - 技能模板库

### 工具函数
- **log-analyzer** - 日志分析工具
- **workspace-tools** - 工作区管理工具

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/duduldu/openclaw-toolkit.git

# 安装依赖
npm install

# 运行工具
npm run cli -- session-manager
```

## 📁 项目结构

```
openclaw-toolkit/
├── cli/                    # 命令行工具
│   ├── session-manager/
│   ├── cron-generator/
│   └── config-checker/
├── skills/                 # Skills 模板
│   ├── skill-creator/
│   └── templates/
├── utils/                  # 工具函数
│   ├── log-analyzer/
│   └── workspace-tools/
├── docs/                   # 文档
├── package.json
└── README.md
```

## 🛠️ 开发

```bash
# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

## 📝 License

MIT License

---

**作者：** @duduldu
