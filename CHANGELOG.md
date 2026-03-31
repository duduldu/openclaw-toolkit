# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-03-29

### Added
- 新增 `skill-creator` CLI 工具完整实现（交互式创建技能、模板选择、自动生成骨架代码）
- 添加 `skill-creator.test.js` 单元测试（5 个测试用例覆盖模板列表、基础技能、API 技能、文件处理技能）
- 新增企业级 API 集成模板参考 (`skills/templates/enterprise/README.md`)，包含认证、重试、文件处理等企业级特性

### Changed
- 更新 `src/cli/index.js` 版本号至 0.3.0
- 将 `skill` 命令从 TODO 占位符改为实际调用 `skill-creator.js` 模块
- 完善 `skill` 命令帮助信息，显示 `create` 和 `templates` 子命令

### Notes
- 企业模板参考 LBX 实际业务场景（加密文件处理、API 解密、批量数据导入）
- 技能创建器支持 5 种模板：basic, api-integration, scheduled-task, file-processor, web-scraper

## [0.3.0] - 2026-03-27

### Added
- 实现 `skill create` 命令，支持交互式创建技能
- 新增技能模板：`file-processor`（文件处理）、`web-scraper`（网页抓取）
- 添加 `docs/` 目录，包含 CLI 使用指南和技能开发文档
- 新增 `CHANGELOG.md` 版本变更记录
- `session-manager` 增加 `--json` 输出格式支持

### Changed
- 更新 `package.json` 版本至 0.3.0
- 完善 `cron-generator` 的自然语言描述逻辑
- 优化 `config-checker` 安全检查提示

### Fixed
- 修复 `session-manager` 在 PowerShell 下的路径解析问题

## [0.2.0] - 2026-03-25

### Added
- 实现 `session-manager` 完整功能（list/info/clean/export）
- 实现 `cron-generator` 完整功能（presets/generate/parse/next）
- 实现 `config-checker` 完整功能（check/init/validate）
- 添加单元测试（session-manager.test.js, cron-generator.test.js）
- 添加技能模板（basic, api-integration, scheduled-task）

### Changed
- 更新 README 添加 CLI 子命令说明
- 更新 .gitignore 排除本地运维脚本

## [0.1.0] - 2026-03-20

### Added
- 项目初始化
- 基础 CLI 框架（基于 commander）
- 基础项目结构（cli/, skills/, utils/, tests/, docs/）
