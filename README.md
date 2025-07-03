# GraphQL ORMify Client

> **项目集成规范**
>
> 本项目所有请求都尽量通过 [graphql-ormify-client](https://www.npmjs.com/package/graphql-ormify-client) 进行处理，不建议直接使用 fetch/axios/wx.request 等原生请求方式。
>
> 推荐优先使用快捷方法处理数据表相关逻辑，无法满足时可用 query/mutate，特殊场景可用 excute。

---

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

## 🛠️ 用法规范与示例

### 准备工作

```typescript
import { HasuraGraphqlClient } from "graphql-ormify-client";

const hasuraClient = new HasuraGraphqlClient({
  endpoint: "https://your-hasura-endpoint.com/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "your-secret",
  },
});
```

### 一、基础方法

- 发送 query：`hasuraClient.query`
- 发送 mutation：`hasuraClient.mutate`
- 直接运行 GraphQL 语句：`hasuraClient.excute`

**参数说明：**
- query/mutate：`{ operationName, fields, variableDefinitions, variables }`
- excute：`{ query, variables }`

### 二、快捷方法（推荐优先使用）

- 通过主键查询：`data_by_pk`
- 条件查询多条：`datas`
- 条件查询单条 `data`
- 写入单条：`insert_data_one`
- 写入多条：`insert_datas`
- 通过主键更新：`update_data_by_pk`
- 相同内容条件批量更新：`update_datas`
- 不同内容条件批量更新 `update_datas_many`
- 通过主键删除：`delete_data_by_pk`
- 分页与聚合查询：`find`
- 聚合查询：`aggregate`

**参数说明：**
- 公共参数：`{ table, args, data_fields | datas_fields }`
- 特殊参数：
  - aggregate：`{ aggregate_fields }`
  - find：`{ page, pageSize, aggregate_fields }`

> 快捷方法基本能满足数据表相关的所有查询，优先使用。若无法满足，可用 query/mutate，若能确定类型结构，也可用 excute。

### 三、特别注意

- 对于部分 GraphQL 语句需要传入枚举参数或变量时，生成器通过"参数为函数"来区分：
  - 错误写法：`order_by: { id: desc }`（会报 desc 未定义）
  - 错误写法：`order_by: { id: "desc" }`（gql 不符合期待）
  - 正确写法：`order_by: { id: () => "desc" }`
  - 生成器遇到函数参数时，会调用函数并将结果作为不带引号的内容片段插入 gql 语句。

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
= `update_datas_many<T>(params): Promise<T[]>` - 根据条件更新数据（可传入不同内容）
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
