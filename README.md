# GraphQL ORMify Client

一个强大的 GraphQL 客户端库，提供类型安全的查询构建和执行功能，支持微信小程序、Web 和 Node.js 环境。

## ✨ 特性

- ✨ **类型安全**: 完整的 TypeScript 支持
- 🏗️ **灵活查询构建**: 支持复杂嵌套查询、别名、参数、指令
- 🐛 **跨平台兼容**: 支持微信小程序、Web 浏览器和 Node.js
- ⚡ **高性能**: 优化的查询生成和执行
- 🐛 **调试友好**: 内置调试模式和请求监听
- 📦 **轻量级**: 无外部依赖
- ✨ **双重模式**: 支持查询构建器和原始查询字符串
- ️✨ **分层架构**: 清晰的代码复用结构
- 🔐 **动态认证**: 支持运行时修改请求头和认证信息
- ✨ **请求监控**: 完整的请求拦截和监听机制
- ✨ **Hasura 集成**: 专门的 HasuraGraphqlClient 类 适用于 Zion 和 Hasura 机制的 graphql

## 🚀 快速开始

### 安装

```bash
npm install graphql-ormify-client
```

### 基本使用

```typescript
import { GraphQLClient } from "graphql-ormify-client";

// 创建客户端
const client = new GraphQLClient({
  endpoint: "https://api.example.com/graphql",
  debug: true,
});

// 执行查询
const result = await client.query({
  operationName: "GetUser",
  fields: [
    {
      name: "users",
      args: {
        where: {
          id: {
            _eq: () => "$id",
          },
        },
      },
      fields: [
        "id",
        "nickname",
        "avatar_url",
        {
          name: "user_posts",
          alias: "posts",
          fields: `id title content`,
        },
      ],
    },
  ],
  variableDefinitions: {
    $id: "ID!",
  },
  variables: {
    id: "123",
  },
});
```

### Hasura 客户端使用

```typescript
import { HasuraGraphqlClient } from "graphql-ormify-client";

// 创建 Hasura 客户端
const hasuraClient = new HasuraGraphqlClient({
  endpoint: "https://your-hasura-endpoint.com/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "your-secret",
  },
});

// 根据 ID 获取用户
const user = await hasuraClient.data_by_pk<User>({
  table: "users",
  args: { id: "123" },
  data_fields: ["id", "name", "email"],
});

// 条件查询
const users = await hasuraClient.datas<User>({
  table: "users",
  args: {
    where: { age: { _gte: 18 } },
    order_by: { created_at: () => "desc" },
    limit: 10,
  },
  datas_fields: ["id", "name", "email", "age"],
});
```

## 📚 文档

详细文档请查看 [examples](./examples/) 目录中的示例文件：

- [基础使用示例](./examples/basic-usage.ts)
- [高级查询示例](./examples/advanced-queries.ts)
- [更新操作示例](./examples/update-operations.ts)
- [业务场景示例](./examples/business-scenarios.ts)
- [错误处理示例](./examples/error-handling.ts)

## 🔧 API 参考

### GraphQLClient

基础 GraphQL 客户端，提供通用的 GraphQL 操作功能。

#### 构造函数

```typescript
new GraphQLClient(config: GraphQLClientConfig)
```

#### 主要方法

- `query<T>(input): Promise<T>` - 执行查询操作
- `mutate<T>(input): Promise<T>` - 执行变更操作
- `execute<T>({query, variables?}): Promise<T>` - 执行原始 GraphQL 查询
- `request<T>(config): Promise<RequestResponse<T>>` - 通用 HTTP 请求

### HasuraGraphqlClient

专门为 Hasura GraphQL Engine 设计的客户端，提供便捷的 CRUD 操作。

#### 快捷方法

- `data_by_pk<T>(params): Promise<T>` - 根据主键获取单条数据
- `data<T>(params): Promise<T>` - 根据条件获取单条数据
- `datas<T>(params): Promise<T[]>` - 根据条件获取多条数据
- `insert_data_one<T>(params): Promise<T>` - 插入单条数据
- `insert_datas<T>(params): Promise<T[]>` - 批量插入数据
- `update_data_by_pk<T>(params): Promise<T>` - 根据主键更新数据
- `update_datas<T>(params): Promise<T[]>` - 根据条件更新数据
- `delete_data_by_pk<T>(params): Promise<T>` - 根据主键删除数据
- `delete_datas<T>(params): Promise<T[]>` - 根据条件删除数据
- `find<TData, TAggregate>(params): Promise<{list: TData[], aggregate: TAggregate}>` - 分页查询
- `aggregate<T>(params): Promise<T>` - 聚合查询

## 支持的环境

- ✅ **微信小程序**: 使用 `wx.request` API
- ✅ **Web 浏览器**: 使用 `fetch` API
- ✅ **Node.js**: 使用 `fetch` API (Node.js 18+)

## 安装

```bash
# npm
npm install graphql-ormify-client

# yarn
yarn add graphql-ormify-client

# pnpm
pnpm add graphql-ormify-client
```

## 相关链接

- [GitHub 仓库](https://github.com/ZachZQY/graphql-ormify-client)
- [问题反馈](https://github.com/ZachZQY/graphql-ormify-client/issues)
- [示例代码](./examples/)

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

- 作者: ZachZQY
- 邮箱: zhangquanyinhahaha@163.com
- 微信: bianzhinet
