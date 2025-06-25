import { HasuraGraphqlClient } from '../src/client/extend-client/HasuraGraphqlClient';

const hasuraClient = new HasuraGraphqlClient({
  endpoint: 'https://your-hasura-endpoint.com/v1/graphql',
  headers: { 'x-hasura-admin-secret': 'your-secret' }
});

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  status: string;
  login_count: number;
  tags: string[];
  notifications: string[];
  metadata: Record<string, any>;
}

async function updateOperationsExample() {
  console.log('=== Hasura 客户端更新操作示例 ===\n');

  try {
    // 1. 基础更新操作
    console.log('1. 基础更新操作');
    const updatedUser = await hasuraClient.update_data_by_pk<User>({
      table: 'users',
      args: {
        pk_columns: { id: '123' },
        _set: {
          name: 'John Updated',
          status: 'active',
          metadata: { last_update: new Date().toISOString() }
        }
      },
      data_fields: ['id', 'name', 'status', 'metadata']
    });
    console.log('更新后的用户:', updatedUser);

    // 2. 数值增加操作
    console.log('\n2. 数值增加操作');
    const incrementedUser = await hasuraClient.update_data_by_pk<User>({
      table: 'users',
      args: {
        pk_columns: { id: '123' },
        _inc: { login_count: 1, age: 1 }
      },
      data_fields: ['id', 'name', 'login_count', 'age']
    });
    console.log('数值增加后的用户:', incrementedUser);

    // 3. 数组操作
    console.log('\n3. 数组操作');
    const arrayUpdatedUser = await hasuraClient.update_data_by_pk<User>({
      table: 'users',
      args: {
        pk_columns: { id: '123' },
        _append: { tags: ['vip', 'premium'] },
        _prepend: { notifications: ['Welcome back!'] }
      },
      data_fields: ['id', 'name', 'tags', 'notifications']
    });
    console.log('数组更新后的用户:', arrayUpdatedUser);

    // 4. 条件批量更新
    console.log('\n4. 条件批量更新');
    const batchUpdatedUsers = await hasuraClient.update_datas<User>({
      table: 'users',
      args: {
        where: { age: { _lt: 18 } },
        _set: { status: 'minor' },
        _append: { tags: ['underage'] }
      },
      datas_fields: ['id', 'name', 'age', 'status', 'tags']
    });
    console.log('批量更新的用户:', batchUpdatedUsers);

    // 5. 复杂批量更新
    console.log('\n5. 复杂批量更新');
    const complexBatchUpdate = await hasuraClient.update_datas_many<User>({
      table: 'users',
      args: {
        updates: [
          {
            where: { id: { _eq: '1' } },
            _set: { status: 'vip' },
            _inc: { login_count: 1 }
          },
          {
            where: { id: { _eq: '2' } },
            _set: { status: 'regular' },
            _append: { tags: ['new_user'] }
          },
          {
            where: { age: { _gte: 65 } },
            _set: { status: 'senior' },
            _prepend: { notifications: ['Senior discount available!'] }
          }
        ]
      },
      datas_fields: ['id', 'name', 'status', 'login_count', 'tags', 'notifications']
    });
    console.log('复杂批量更新结果:', complexBatchUpdate);

  } catch (error) {
    console.error('更新操作失败:', error);
  }
}

export { updateOperationsExample };
