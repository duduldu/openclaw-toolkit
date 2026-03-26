# Skill 模板库

OpenClaw Skill 模板集合，用于快速创建新技能。

## 使用方法

```bash
# 使用 skill 命令创建新技能
oc-toolkit skill create <skill-name>
```

## 可用模板

### 基础模板 (basic)
最简单的 Skill 结构，适合单一功能的技能。

### API 集成模板 (api-integration)
用于集成外部 API 的技能模板，包含错误处理和重试逻辑。

### 定时任务模板 (scheduled-task)
用于创建 cron 定时任务的技能模板。

### 文件处理模板 (file-processor)
用于处理文件的技能模板，支持多种文件格式。

## 模板结构

每个模板包含：
- `SKILL.md` - 技能描述和触发条件
- `index.js` - 技能主逻辑（如需要）
- `scripts/` - 辅助脚本（如需要）
- `references/` - 参考文档（如需要）

## 贡献模板

欢迎贡献新模板！请确保：
1. 模板有清晰的用途说明
2. 包含必要的错误处理
3. 遵循 OpenClaw Skill 规范
4. 有使用示例
