import { HasuraGraphqlClient } from '../src/client/extend-client/HasuraGraphqlClient';

const hasuraClient = new HasuraGraphqlClient({
  endpoint: 'https://your-hasura-endpoint.com/v1/graphql',
  headers: { 'x-hasura-admin-secret': 'your-secret' },
  debug: true
});

// 添加请求监听器
hasuraClient.addListener({
  onRequest: (lifecycle) => {
    console.log(`🚀 开始请求: ${lifecycle.config.url}`);
    console.log('请求配置:', lifecycle.config);
  },
  onResponse: (lifecycle) => {
    if (lifecycle.success) {
      console.log(`✅ 请求成功: ${lifecycle.duration}ms`);
    } else {
      console.error(`❌ 请求失败:`, lifecycle.error);
    }
  }
});

async function errorHandlingExample() {
  console.log('=== Hasura 客户端错误处理示例 ===\n');

  try {
    // 1. 正常操作
    console.log('1. 正常查询操作');
    const users = await hasuraClient.datas({
      table: 'users',
      args: { limit: 5 },
      datas_fields: ['id', 'name']
    });
    console.log('查询成功:', users);

  } catch (error) {
    console.error('查询失败:', error);
    
    // 错误类型判断
    if (error.status === 401) {
      console.log('认证失败，需要重新登录');
    } else if (error.status === 404) {
      console.log('资源不存在');
    } else if (error.status >= 500) {
      console.log('服务器错误，请稍后重试');
    }
  }

  try {
    // 2. 错误操作 - 查询不存在的表
    console.log('\n2. 查询不存在的表');
    await hasuraClient.datas({
      table: 'non_existent_table',
      args: {},
      datas_fields: ['id']
    });
  } catch (error) {
    console.error('预期的错误:', error.message);
  }

  try {
    // 3. 错误操作 - 无效的字段
    console.log('\n3. 查询无效字段');
    await hasuraClient.datas({
      table: 'users',
      args: {},
      datas_fields: ['invalid_field']
    });
  } catch (error) {
    console.error('字段错误:', error.message);
  }
}

export { errorHandlingExample };
