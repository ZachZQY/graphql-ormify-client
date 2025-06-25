import { HasuraGraphqlClient } from '../src/client/extend-client/HasuraGraphqlClient';

const hasuraClient = new HasuraGraphqlClient({
  endpoint: 'https://your-hasura-endpoint.com/v1/graphql',
  headers: { 'x-hasura-admin-secret': 'your-secret' }
});

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  last_login: string;
  login_count: number;
  login_history: string[];
  session_data: Record<string, any>;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  items: any[];
  created_at: string;
}

async function businessScenariosExample() {
  console.log('=== Hasura 客户端业务场景示例 ===\n');

  try {
    // 场景1: 用户登录
    console.log('场景1: 用户登录');
    const loginUpdate = await hasuraClient.update_data_by_pk<User>({
      table: 'users',
      args: {
        pk_columns: { id: 'user123' },
        _set: {
          last_login: new Date().toISOString(),
          status: 'online',
          session_data: {
            token: 'abc123',
            expires: new Date(Date.now() + 3600000).toISOString()
          }
        },
        _inc: { login_count: 1 },
        _append: { login_history: [new Date().toISOString()] }
      },
      data_fields: ['id', 'name', 'status', 'login_count', 'last_login']
    });
    console.log('登录更新结果:', loginUpdate);

    // 场景2: 购物车操作
    console.log('\n场景2: 购物车操作');
    const cartUpdate = await hasuraClient.update_data_by_pk<Order>({
      table: 'orders',
      args: {
        pk_columns: { id: 'cart456' },
        _set: {
          updated_at: new Date().toISOString(),
          total_amount: 299.99
        },
        _append: {
          items: [
            { product_id: 'prod_001', quantity: 2, price: 149.99 }
          ]
        }
      },
      data_fields: ['id', 'total_amount', 'items']
    });
    console.log('购物车更新结果:', cartUpdate);

    // 场景3: 用户状态管理
    console.log('\n场景3: 用户状态管理');
    const statusUpdates = await hasuraClient.update_datas_many<User>({
      table: 'users',
      args: {
        updates: [
          // 活跃用户
          {
            where: {
              last_login: { _gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
            },
            _set: { status: 'active' },
            _append: { tags: ['recently_active'] }
          },
          // 不活跃用户
          {
            where: {
              last_login: { _lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
            },
            _set: { status: 'inactive' },
            _append: { tags: ['inactive_user'] }
          }
        ]
      },
      datas_fields: ['id', 'name', 'status', 'tags']
    });
    console.log('状态更新结果:', statusUpdates);

    // 场景4: 数据统计和分析
    console.log('\n场景4: 数据统计和分析');
    const analytics = await hasuraClient.find<User, any>({
      table: 'users',
      page: 1,
      pageSize: 100,
      args: {
        where: { status: { _eq: 'active' } },
        order_by: { login_count: () => 'desc' }
      },
      datas_fields: ['id', 'name', 'login_count', 'last_login'],
      aggregate_fields: [
        'count',
        {
          name: 'avg',
          fields: ['login_count']
        },
        {
          name: 'max',
          fields: ['login_count']
        }
      ]
    });
    console.log('用户分析数据:', analytics);

  } catch (error) {
    console.error('业务场景操作失败:', error);
  }
}

export { businessScenariosExample };
