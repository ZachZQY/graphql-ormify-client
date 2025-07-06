// 声明微信小程序全局变量
declare const wx: any;
// 声明node环境全局变量
declare const global: any;
declare const process: any;
// 声明浏览器环境全局变量
declare const window: any;

/**
 * 获取当前运行环境
 * @returns "WX-MINI" | "WEB" | "NODE"
 */
function getEnv(): "WX-MINI" | "WEB" | "NODE" {
  if (
    typeof wx !== "undefined" &&
    typeof global !== "undefined" &&
    typeof window === "undefined" &&
    typeof process === "undefined"
  ) {
    return "WX-MINI";
  } else if (
    typeof global !== "undefined" &&
    typeof process !== "undefined" &&
    typeof window === "undefined" &&
    typeof wx === "undefined"
  ) {
    return "NODE";
  } else if (typeof window !== "undefined") {
    return "WEB";
  } else {
    throw new Error("Unknown environment");
  }
}

/**
 * 请求配置接口
 * @example
 * {
 *   url: string;
 *   method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
 *   headers?: Record<string, string>;
 *   data?: any;
 *   timeout?: number;
 * }
 */
export interface RequestConfig {
  isGraphqlEndpoint?: boolean;
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

/**
 * 请求响应接口
 * @example
 * {
 *   data: any;
 *   status: number;
 *   statusText: string;
 *   headers: Record<string, string>;
 * }
 */
export interface RequestResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * 智能处理请求体数据
 * @param data 请求体数据
 * @param headers 请求头
 * @returns 处理后的请求体数据
 */
function processRequestBody(data: any, headers: Record<string, string>): any {
  // 如果没有数据，返回 undefined
  if (data === undefined || data === null) {
    return undefined;
  }

  // 如果已经是字符串，直接返回
  if (typeof data === 'string') {
    return data;
  }

  // 如果是 FormData，直接返回
  if (data instanceof FormData) {
    return data;
  }

  // 如果是 URLSearchParams，直接返回
  if (data instanceof URLSearchParams) {
    return data;
  }

  // 如果是 ArrayBuffer 或 Blob，直接返回
  if (data instanceof ArrayBuffer || data instanceof Blob) {
    return data;
  }

  // 如果是普通对象或数组，转换为 JSON
  if (typeof data === 'object') {
    // 检查是否已经设置了 Content-Type
    const contentType = headers['Content-Type'] || headers['content-type'];
    
    if (!contentType || contentType.includes('application/json')) {
      // 默认使用 JSON
      return JSON.stringify(data);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // URL 编码格式
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      return params;
    } else if (contentType.includes('multipart/form-data')) {
      // 表单数据格式
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });
      return formData;
    }
    
    // 默认使用 JSON
    return JSON.stringify(data);
  }

  // 其他类型转换为字符串
  return String(data);
}

/**
 * 兼容微信小程序和 fetch 的请求方法
 * @param config 请求配置
 * @param config.url 请求 URL
 * @param config.method 请求方法 默认 GET 可选 POST、PUT、DELETE、HEAD、OPTIONS、PATCH
 * @param config.headers 请求头
 * @param config.data 请求体数据
 * @param config.timeout 请求超时时间
 * @returns 请求响应
 * @example
 * const response = await request({
 *   url: "https://api.example.com",
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   data: { id: 1 },
 *   timeout: 30000,
 * });
 */
export function request<T = any>(config: RequestConfig): Promise<RequestResponse<T>> {
  const env = getEnv();
  const { url, method = "GET", headers = {}, data, timeout = 30000 } = config;

  return new Promise((resolve, reject) => {
    if (env === "WX-MINI") {
      // 微信小程序环境
      const requestTask = wx.request({
        url,
        method,
        data: data, // 微信小程序直接使用原始数据
        header: headers,
        timeout: timeout,
        success: (res: any) => {
          resolve({
            data: res.data,
            status: res.statusCode,
            statusText: res.errMsg || '',
            headers: res.header || {}
          });
        },
        fail: (err: any) => {
          reject({
            message: err.errMsg || 'Request failed',
            status: err.statusCode || 0,
            error: err
          });
        }
      });

      // 超时处理
      if (timeout > 0) {
        setTimeout(() => {
          requestTask.abort();
          reject({
            message: 'Request timeout',
            status: 408,
            error: new Error('Request timeout')
          });
        }, timeout);
      }
    } else if (env === "NODE" || env === "WEB") {
      // Node.js 或 Web 环境
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject({
          message: 'Request timeout',
          status: 408,
          error: new Error('Request timeout')
        });
      }, timeout);

      // 处理请求体数据
      const processedBody = processRequestBody(data, headers);

      fetch(url, {
        method,
        body: processedBody,
        headers,
        signal: controller.signal
      })
        .then((response) => {
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            reject({
              message: `HTTP error! status: ${response.status} ${response.statusText}`,
              status: response.status,
              statusText: response.statusText,
              response
            });
            return;
          }

          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("application/json")) {
            return response.json().then((data) => ({
              data,
              status: response.status,
              statusText: response.statusText,
              headers: Array.from(response.headers.entries()).reduce((acc, [k, v]) => {
                acc[k] = v;
                return acc;
              }, {} as Record<string, string>)
            }));
          } else {
            return response.text().then((data) => ({
              data,
              status: response.status,
              statusText: response.statusText,
              headers: Array.from(response.headers.entries()).reduce((acc, [k, v]) => {
                acc[k] = v;
                return acc;
              }, {} as Record<string, string>)
            }));
          }
        })
        .then((result) => {
          if (result) {
            resolve(result);
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject({
            message: error.message || 'Request failed',
            status: 0,
            error
          });
        });
    } else {
      reject({
        message: `Request is not supported in this environment: ${env}`,
        status: 0,
        error: new Error(`Unsupported environment: ${env}`)
      });
    }
  });
} 