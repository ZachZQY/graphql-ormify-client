# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-06-27

### Changed
- 新增 GraphQLClientError 错误类，抛出错误时包含 query、variables、data、errors 信息，便于调试和错误处理。 
- 排序支持传入数组方式

## [1.0.0] - 2025-06-25

### Added
- 初始版本发布
- GraphQLBuilderCore 核心构建器
- GraphQLClient 基础客户端
- HasuraGraphqlClient Hasura 专用客户端
- 完整的 TypeScript 类型支持
- 跨平台兼容性（微信小程序、Web、Node.js）
- 动态认证管理
- 请求监控和监听机制
- 查询构建器模式
- 原始 GraphQL 查询执行
- 完整的 CRUD 操作支持
- 聚合查询和分页查询
- 错误处理和调试模式

### Features
- 类型安全的查询构建
- 灵活的字段定义和嵌套查询
- 支持 GraphQL 变量和指令
- 智能的请求工具，自动检测环境
- 完整的 Hasura 操作符支持
- 批量操作和条件查询
- 请求生命周期监听
- 详细的错误信息和调试输出

### Technical
- 无外部依赖的轻量级设计
- 完整的 TypeScript 类型定义
- 模块化的代码架构
- 支持多种构建格式（ESM、CommonJS、UMD）
- 完整的测试覆盖
- 详细的文档和示例
