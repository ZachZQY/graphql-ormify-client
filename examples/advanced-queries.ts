import { HasuraGraphqlClient } from "../src/client/extend-client/HasuraGraphqlClient";

const hasuraClient = new HasuraGraphqlClient({
  endpoint: "https://your-hasura-endpoint.com/v1/graphql",
  headers: { "x-hasura-admin-secret": "your-secret" },
});

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  status: string;
  posts: Post[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
}

async function advancedQueriesExample() {
  console.log("=== Hasura 客户端高级查询示例 ===\n");

  try {
    // 1. 复杂条件查询
    console.log("1. 复杂条件查询");
    const activeUsers = await hasuraClient.datas<User>({
      table: "users",
      args: {
        where: {
          _and: [
            { age: { _gte: 18 } },
            { status: { _eq: "active" } },
            { email: { _ilike: "%@gmail.com" } },
          ],
        },
        order_by: { age: () => "desc" },
        limit: 20,
        offset: 0,
      },
      datas_fields: ["id", "name", "email", "age", "status"],
    });
    console.log("活跃用户:", activeUsers);

    // 2. 嵌套查询
    console.log("\n2. 嵌套查询");
    const usersWithPosts = await hasuraClient.datas<User>({
      table: "users",
      args: {
        where: { id: { _eq: "123" } },
      },
      datas_fields: [
        "id",
        "name",
        "email",
        {
          name: "posts",
          args: {
            where: { created_at: { _gte: "2023-01-01" } },
            order_by: { created_at: () => "desc" },
            limit: 5,
          },
          fields: [
            "id",
            "title",
            "content",
            {
              name: "comments",
              fields: ["id", "content"],
            },
          ],
        },
      ],
    });
    console.log("用户及其文章:", usersWithPosts);

    // 3. 聚合查询
    console.log("\n3. 聚合查询");
    const userStats = await hasuraClient.aggregate({
      table: "users",
      args: {
        where: { age: { _gte: 18 } },
      },
      aggregate_fields: [
        "count",
        {
          name: "avg",
          fields: ["age"],
        },
        {
          name: "max",
          fields: ["age"],
        },
      ],
    });
    console.log("用户统计:", userStats);

    // 4. 分页查询带聚合
    console.log("\n4. 分页查询带聚合");
    const paginatedResult = await hasuraClient.find<User>({
      table: "users",
      page: 1,
      pageSize: 10,
      args: {
        where: {
          status: { _eq: "active" },
          id: {
            _eq: 12,
          },
        },
        order_by: { created_at: () => "desc" },
      },
      datas_fields: ["id", "name", "email", "age"],
      aggregate_fields: [
        "count",
        {
          name: "avg",
          fields: ["age"],
        },
      ],
    });
    console.log("分页结果:", paginatedResult.aggregate);
  } catch (error) {
    console.error("查询失败:", error);
  }
}

export { advancedQueriesExample };
