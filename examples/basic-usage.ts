import { HasuraGraphqlClient } from '../src/client/extend-client/HasuraGraphqlClient';

// 创建 Hasura 客户端
const hasuraClient = new HasuraGraphqlClient({
  endpoint: 'https://your-hasura-endpoint.com/v1/graphql',
  headers: {
    'x-hasura-admin-secret': 'your-secret',
    'x-hasura-role': 'user'
  },
  debug: true
});

// 定义用户类型
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  created_at: string;
}

// 定义文章类型
interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

async function basicUsageExample() {
  console.log('=== Hasura 客户端基础使用示例 ===\n');

  try {
    // 1. 根据 ID 获取用户
    console.log('1. 根据 ID 获取用户');
    const user = await hasuraClient.data_by_pk<User>({
      table: 'users',
      args: { id: '123' },
      data_fields: ['id', 'name', 'email', 'age']
    });
    console.log('用户信息:', user);

    // 2. 条件查询用户
    console.log('\n2. 条件查询用户');
    const users = await hasuraClient.datas<User>({
      table: 'users',
      args: {
        where: { age: { _gte: 18 } },
        order_by: { created_at: () => "asc_nulls_first" },
        limit: 10
      },
      datas_fields: ['id', 'name', 'email', 'age']
    });
    console.log('成年用户列表:', users);

    // 3. 插入用户
    console.log('\n3. 插入用户');
    const newUser = await hasuraClient.insert_data_one<User>({
      table: 'users',
      args: {
        object: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25
        }
      },
      data_fields: ['id', 'name', 'email']
    });
    console.log('新用户:', newUser);

    // 4. 更新用户
    console.log('\n4. 更新用户');
    const updatedUser = await hasuraClient.update_data_by_pk<User>({
      table: 'users',
      args: {
        pk_columns: { id: '123' },
        _set: { age: 26 }
      },
      data_fields: ['id', 'name', 'age']
    });
    console.log('更新后的用户:', updatedUser);

    // 5. 删除用户
    console.log('\n5. 删除用户');
    const deletedUser = await hasuraClient.delete_data_by_pk<User>({
      table: 'users',
      args: { id: '123' },
      data_fields: ['id', 'name', 'email']
    });
    console.log('删除的用户:', deletedUser);

  } catch (error) {
    console.error('操作失败:', error);
  }
}

export { basicUsageExample };
