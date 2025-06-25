import { GraphQLBuilderCore,GraphQLFields,GraphQLOperation,OperationInput,OperationResult } from "../GraphQLBuilderCore";
import { request, RequestResponse, RequestConfig } from "../utils/request";
export type { RequestResponse, RequestConfig, GraphQLFields,GraphQLOperation,OperationInput,OperationResult };
/**
 * 请求生命周期事件
 */
export interface RequestLifecycle {
  id: string; // 请求唯一标识
  config: RequestConfig; // 请求配置
  startTime: number; // 开始时间戳
  endTime?: number; // 结束时间戳
  duration?: number; // 耗时（毫秒）
  success?: boolean; // 是否成功
  response?: RequestResponse<any>; // 响应数据
  error?: any; // 错误信息
  status?: "pending" | "success" | "error"; // 请求状态
}

/**
 * GraphQL 客户端配置
 */
export interface GraphQLClientConfig {
  /** GraphQL 服务器端点 URL */
  endpoint: string;
  /** 请求头配置 */
  headers?: Record<string, string>;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 是否启用调试模式 */
  debug?: boolean;
}

/**
 * 请求监听器接口
 */
export interface RequestListener {
  onRequest?: (lifecycle: RequestLifecycle) => void | Promise<void>;
  onResponse?: (lifecycle: RequestLifecycle) => void | Promise<void>;
}

export class GraphQLClient extends GraphQLBuilderCore {
  private config: GraphQLClientConfig;
  private dynamicHeaders: Record<string, string> = {};
  private listeners: RequestListener[] = [];

  constructor(config: GraphQLClientConfig) {
    super();
    this.config = {
      timeout: 30000,
      debug: false,
      ...config,
    };
  }

  /**
   * 添加请求监听器
   * @param listener 监听器对象
   */
  addListener(listener: RequestListener): void {
    this.listeners.push(listener);
  }

  /**
   * 移除请求监听器
   * @param listener 要移除的监听器对象
   */
  removeListener(listener: RequestListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 清除所有监听器
   */
  clearListeners(): void {
    this.listeners = [];
  }

  /**
   * 设置请求头
   * @param headers 要设置的请求头对象
   */
  setHeaders(headers: Record<string, string>): void {
    this.dynamicHeaders = { ...headers };
  }

  /**
   * 获取当前所有请求头
   * @returns 合并后的请求头对象
   */
  getHeaders(): Record<string, string> {
    return {
      ...this.config.headers,
      ...this.dynamicHeaders,
    };
  }

  /**
   * 添加单个请求头
   * @param key 请求头名称
   * @param value 请求头值
   */
  addHeader(key: string, value: string): void {
    this.dynamicHeaders[key] = value;
  }

  /**
   * 移除单个请求头
   * @param key 要移除的请求头名称
   */
  removeHeader(key: string): void {
    delete this.dynamicHeaders[key];
  }

  /**
   * 清除所有动态请求头
   */
  clearHeaders(): void {
    this.dynamicHeaders = {};
  }

  /**
   * 设置认证 token
   * @param token 认证 token
   * @param type 认证类型，默认为 'Bearer'
   */
  setAuthToken(token: string, type: "Bearer" | "Basic" = "Bearer"): void {
    if (type === "Bearer") {
      this.addHeader("Authorization", `Bearer ${token}`);
    } else if (type === "Basic") {
      this.addHeader("Authorization", `Basic ${token}`);
    }
  }

  /**
   * 移除认证 token
   */
  removeAuthToken(): void {
    this.removeHeader("Authorization");
  }

  /**
   * 生成请求唯一标识
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 安全执行监听器
   */
  private safeExecuteListener(
    listener: RequestListener,
    lifecycle: RequestLifecycle,
    isRequest: boolean
  ): void {
    try {
      if (isRequest) {
        if (this.config.debug) {
          console.log(
            `ID ${lifecycle.id} request:`,
            JSON.parse(JSON.stringify(lifecycle))
          );
        }
        listener.onRequest?.(lifecycle);
      } else {
        if (this.config.debug) {
          console.log(
            `ID ${lifecycle.id} response:`,
            JSON.parse(JSON.stringify(lifecycle))
          );
        }
        listener.onResponse?.(lifecycle);
      }
    } catch (err) {
      if (this.config.debug) {
        console.warn("Listener error:", err);
      }
    }
  }

  /**
   * 通用 HTTP 请求方法
   * 支持微信小程序、Web 和 Node.js 环境
   */
  async request<T = any>(config: RequestConfig): Promise<RequestResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    // 创建生命周期对象
    const lifecycle: RequestLifecycle = {
      id: requestId,
      config: { ...config },
      startTime,
      status: "pending",
    };

    // 通知请求开始
    for (const listener of this.listeners) {
      this.safeExecuteListener(listener, lifecycle, true);
    }

    try {
      // 执行实际请求
      const response = await request<T>(config);

      // 更新生命周期信息
      const endTime = Date.now();
      lifecycle.endTime = endTime;
      lifecycle.duration = endTime - startTime;
      lifecycle.success = true;
      lifecycle.response = response;
      lifecycle.status = "success";

      // 通知请求完成
      for (const listener of this.listeners) {
        this.safeExecuteListener(listener, lifecycle, false);
      }

      return response;
    } catch (error) {
      // 更新生命周期信息
      const endTime = Date.now();
      lifecycle.endTime = endTime;
      lifecycle.duration = endTime - startTime;
      lifecycle.success = false;
      lifecycle.error = error;
      lifecycle.status = "error";

      // 通知请求失败
      for (const listener of this.listeners) {
        this.safeExecuteListener(listener, lifecycle, false);
      }

      throw error;
    }
  }

  /**
   * 执行 GraphQL 操作
   * 直接传入 GraphQL 查询字符串，支持 query、mutation、subscription 等所有操作
   */
  async execute<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.getHeaders(),
    };

    try {
      const response: RequestResponse<{ data?: T; errors?: any[] }> =
        await this.request({
          url: this.config.endpoint,
          method: "POST",
          headers,
          data: {
            query,
            variables: variables || {},
          },
          timeout: this.config.timeout,
        });

      const result = response.data;

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data as T;
    } catch (error: any) {
      if (this.config.debug) {
        console.error("GraphQL execute failed:", error);
      }
      throw error;
    }
  }

  /**
   * 执行 GraphQL 查询
   * 使用查询构建器生成查询语句，然后复用 execute
   */
  async query<T = any>(
    input: Omit<Parameters<typeof this.buildQuery>[0], "operationType">
  ): Promise<T> {
    const operation: OperationResult = this.buildQuery(input);
    return this.execute<T>(operation.query, operation.variables);
  }

  /**
   * 执行 GraphQL 变更
   * 使用查询构建器生成变更语句，然后复用 execute
   */
  async mutate<T = any>(
    input: Omit<Parameters<typeof this.buildMutation>[0], "operationType">
  ): Promise<T> {
    const operation = this.buildMutation(input);
    return this.execute<T>(operation.query, operation.variables);
  }

  /**
   * 执行 GraphQL 订阅
   * 使用查询构建器生成订阅语句
   * 注意：订阅功能后续支持
   */
  async subscribe<T = any>(
    input: Omit<Parameters<typeof this.buildSubscription>[0], "operationType">
  ): Promise<T> {
    const operation = this.buildSubscription(input);

    if (this.config.debug) {
      console.log("GraphQL Subscription:", operation.query);
      console.log("GraphQL Variables:", operation.variables);
    }

    // TODO: 实现订阅功能
    throw new Error(
      "Subscription is not supported yet. Please use execute for now."
    );
  }
}