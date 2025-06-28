import { GraphQLClient, GraphQLClientConfig } from "../GraphQLClient";
import {
  PrimaryKey,
  // 分页查询
  FindParams,
  // 聚合
  AggregateParams,
  // 查询
  DataByPkParams,
  DatasParams,
  DataParams,
  // 插入
  InsertDataOneParams,
  InsertDatasParams,
  // 更新
  UpdateDataByPkParams,
  UpdateDatasParams,
  UpdateDatasManyParams,
  // 删除
  DeleteDatasParams,
  DeleteDataByPkParams,
} from "../../types/client/extend-client/HasuraGraphqlClient";

export type DefaultDataFieldsType = {
  id: PrimaryKey;
  [key: string]: any;
} | null;
export type DefaultAggregateFieldsType = {
  count?: number | null;
  sum?: Record<string, number | null>;
  avg?: Record<string, number | null>;
  min?: Record<string, number | null>;
  max?: Record<string, number | null>;
  [key: string]: any;
};

export class HasuraGraphqlClient extends GraphQLClient {
  /**
   * @param config 配置对象
   * @param config.endpoint 必填 如: "http://localhost:8080/v1/graphql"
   * @param config.headers 请求头配置 可选 如: { "Content-Type": "application/json" }
   * @param config.timeout 请求超时时间 可选 如: 10000
   * @param config.debug 是否启用调试模式 可选 如: true
   * @example
   * ```ts
   * const client = new HasuraGraphqlClient({
   *   endpoint: "http://localhost:8080/v1/graphql",
   *   timeout: 30000, // 30s
   *   debug: true, // 启用调试模式
   * });
   * const result = await client.data_by_pk({
   *   table: "users",
   *   args: { id: 1 },
   *   data_fields: "id,name,email",
   * });
   * console.log(result); // { id: 1, name: "John", email: "john@example.com" }
   * ```
   */
  constructor(config: GraphQLClientConfig) {
    super(config);
  }

  /**
   * 根据 ID 获取单条数据 (对应graphql的query: ${table}_by_pk)
   * @param params 参数对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 查询参数 如: { where: { id: { _eq: 1 } } }
   * @param params.args.id 主键值 必填 如: 1
   * @param params.data_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async data_by_pk<DataFieldsType = DefaultDataFieldsType>(
    params: DataByPkParams
  ): Promise<DataFieldsType> {
    const { table, args, data_fields = "id" } = params;
    const operationName = `Get${table}ById`;
    const queryName = `${table}_by_pk`;
    const result = await this.query<{ [key: string]: DataFieldsType }>({
      operationName,
      fields: {
        name: queryName,
        args,
        fields: data_fields,
      },
    });
    return result[queryName];
  }

  /**
   * 根据条件获取多条数据 (对应graphql的query: ${table})
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { where: { id: { _eq: 1 } } }
   * @param params.args.where 查询条件 如: { id: { _eq: 1 } }
   * @param params.args.limit 限制返回的条数 如: 10
   * @param params.args.offset 偏移量 如: 0
   * @param params.args.order_by 排序 如: { id: ()=>"asc" } }
   * @param params.args.distinct_on 去重 如: ()=>["id"]
   * @param params.datas_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async datas<DataFieldsType = DefaultDataFieldsType>(
    params: DatasParams
  ): Promise<DataFieldsType[]> {
    const { table, args, datas_fields = "id" } = params;
    const operationName = `Get${table}s`;
    const result = await this.query<{ [key: string]: DataFieldsType[] }>({
      operationName,
      fields: {
        name: table,
        args,
        fields: datas_fields,
      },
    });
    return result[table] || [];
  }

  /**
   * 根据条件获取单条数据 (对应graphql的query: ${table})
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { where: { id: { _eq: 1 } } }
   * @param params.args.where 查询条件 如: { id: { _eq: 1 } }
   * @param params.args.limit 固定为1
   * @param params.args.offset 偏移量 如: 0
   * @param params.args.order_by 排序 如: { id: ()=>"asc" } }
   * @param params.args.distinct_on 去重 如: ()=>["id"]
   * @param params.data_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async data<DataFieldsType = DefaultDataFieldsType>(
    params: DataParams
  ): Promise<DataFieldsType | undefined> {
    const { table, args, data_fields = "id" } = params;
    const finalArgs = { ...args, limit: 1 };
    const datas = await this.datas<DataFieldsType>({
      table,
      args: finalArgs,
      datas_fields: data_fields,
    });
    return datas[0];
  }

  /**
   * 插入单条数据 (对应graphql的mutation: insert_xxx_one)
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { object: { name: "John", email: "john@example.com" } }
   * @param params.args.object 插入的数据 必填 如: { name: "John", email: "john@example.com" }
   * @param params.args.on_conflict 冲突处理 可选 如: { constraint: ()=>"users_pkey", update_columns: ()=>["name"] }
   * @param params.data_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async insert_data_one<DataFieldsType = DefaultDataFieldsType>(
    params: InsertDataOneParams
  ): Promise<DataFieldsType> {
    const { table, args, data_fields = "id" } = params;
    const operationName = `Insert${table}One`;
    const mutationName = `insert_${table}_one`;
    const result = await this.mutate<{ [key: string]: DataFieldsType }>({
      operationName,
      fields: {
        name: mutationName,
        args: {
          object: () => "$object",
          ...Object.keys(args).reduce((acc, key) => {
            if (key !== "object") {
              acc[key] = args[key as keyof typeof args];
            }
            return acc;
          }, {} as Record<string, any>),
        },
        fields: data_fields,
      },
      variableDefinitions: { $object: `${table}_insert_input!` },
      variables: { object: args.object },
    });
    return result[mutationName];
  }

  /**
   * 批量插入多条数据 (对应graphql的mutation: insert_xxx)
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { objects: [{ name: "John", email: "john@example.com" }] }
   * @param params.args.objects 插入的数据 必填 如: [{ name: "John", email: "john@example.com" }]
   * @param params.args.on_conflict 冲突处理 可选 如: { constraint: ()=>"users_pkey", update_columns: ()=>["name"] }
   * @param params.datas_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async insert_datas<DataFieldsType = DefaultDataFieldsType>(
    params: InsertDatasParams
  ): Promise<DataFieldsType[]> {
    const { table, args, datas_fields = "id" } = params;
    const operationName = `Insert${table}`;
    const mutationName = `insert_${table}`;
    const result = await this.mutate<{
      [key: string]: { returning: DataFieldsType[] };
    }>({
      operationName,
      fields: {
        name: mutationName,
        args: {
          objects: () => "$objects",
          ...Object.keys(args).reduce((acc, key) => {
            if (key !== "objects") {
              acc[key] = args[key as keyof typeof args];
            }
            return acc;
          }, {} as Record<string, any>),
        },
        fields: {
          name: "returning",
          fields: datas_fields,
        },
      },
      variableDefinitions: { $objects: `[${table}_insert_input!]!` },
      variables: { objects: args.objects },
    });
    return result[mutationName].returning;
  }

  /**
   * 根据主键更新单条数据 (对应graphql的mutation: update_xxx_by_pk)
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { _set: { name: "John" }, where: { id: { _eq: 1 } } }
   * @param params.args.pk_columns 主键值 必填 如: { id: 1 }
   * @param params.args.pk_columns.id 主键值 必填 如: 1
   * @param params.args._set 更新数据 与 _inc 二选一 如: { name: "John" }
   * @param params.args._inc 字段自增 与 _set 二选一 如: { score: 1 }
   * @param params.data_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async update_data_by_pk<DataFieldsType = DefaultDataFieldsType>(
    params: UpdateDataByPkParams
  ): Promise<DataFieldsType> {
    const { table, args, data_fields = "id" } = params;
    const operationName = `Update${table}ById`;
    const mutationName = `update_${table}_by_pk`;
    const result = await this.mutate<{ [key: string]: DataFieldsType }>({
      operationName,
      fields: {
        name: mutationName,
        args: {
          _set: () => "$_set",
          ...Object.keys(args).reduce((acc, key) => {
            if (key !== "_set") {
              acc[key] = args[key as keyof typeof args];
            }
            return acc;
          }, {} as Record<string, any>),
        },
        fields: data_fields,
      },
      variableDefinitions: {
        $_set: `${table}_set_input!`,
      },
      variables: { _set: args._set },
    });
    return result?.[mutationName];
  }

  /**
   * 根据条件批量更新数据 (对应graphql的mutation: update_xxx)
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { _set: { name: "John" }, where: { id: { _eq: 1 } } }
   * @param params.args._set 更新数据 与 _inc 二选一 如: { name: "John" }
   * @param params.args._inc 字段自增 与 _set 二选一 如: { score: 1 }
   * @param params.args.where 查询条件 必填 如: { id: { _eq: 1 } }
   * @param params.datas_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async update_datas<DataFieldsType = DefaultDataFieldsType>(
    params: UpdateDatasParams
  ): Promise<DataFieldsType[]> {
    const { table, args, datas_fields = "id" } = params;
    const operationName = `Update${table}`;
    const mutationName = `update_${table}`;
    const result = await this.mutate<{
      [key: string]: { returning: DataFieldsType[] };
    }>({
      operationName,
      fields: {
        name: mutationName,
        args: {
          _set: () => "$_set",
          // 排除_set后的其他参数
          ...Object.keys(args).reduce((acc, key) => {
            if (key !== "_set") {
              acc[key] = args[key as keyof typeof args];
            }
            return acc;
          }, {} as Record<string, any>),
        },
        fields: {
          name: "returning",
          fields: datas_fields,
        },
      },
      variableDefinitions: {
        $_set: `${table}_set_input!`,
      },
      variables: {
        _set: args?._set,
      },
    });
    return result?.[mutationName]?.returning;
  }

  /**
   * 批量更新多条数据 (对应graphql的mutation: update_xxx_many)
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { updates: [{ _set: { name: "John" }, pk_columns: { id: 1 } }] }
   * @param params.args.updates 更新数据 必填 如: [{ _set: { name: "John" }, pk_columns: { id: 1 } }]
   * @param params.args.updates[]._set 更新数据 与 _inc 二选一 如: { name: "John" }
   * @param params.args.updates[]._inc 字段自增 与 _set 二选一 如: { score: 1 }
   * @param params.args.updates[].where 查询条件 必填 如: { id: { _eq: 1 } }
   * @param params.datas_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async update_datas_many<DataFieldsType = DefaultDataFieldsType>(
    params: UpdateDatasManyParams
  ): Promise<DataFieldsType[][]> {
    const { table, args, datas_fields = "id" } = params;
    const operationName = `Update${table}Many`;
    const mutationName = `update_${table}_many`;
    const result = await this.mutate<{
      [key: string]: { returning: DataFieldsType[] }[];
    }>({
      operationName,
      fields: {
        name: mutationName,
        args: { updates: () => "$updates" },
        fields: {
          name: "returning",
          fields: datas_fields,
        },
      },
      variableDefinitions: { $updates: `[${table}_updates!]!` },
      variables: { updates: args.updates },
    });
    return result[mutationName].map((item) => item.returning);
  }

  /**
   * 根据条件删除数据 (对应graphql的mutation: delete_xxx)
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { where: { id: { _eq: 1 } } }
   * @param params.args.where 查询条件 必填 如: { id: { _eq: 1 } }
   * @param params.datas_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async delete_datas<DataFieldsType = DefaultDataFieldsType>(
    params: DeleteDatasParams
  ): Promise<DataFieldsType[]> {
    const { table, args, datas_fields = "id" } = params;
    const operationName = `Delete${table}`;
    const mutationName = `delete_${table}`;
    const result = await this.mutate<{
      [key: string]: { returning: DataFieldsType[] };
    }>({
      operationName,
      fields: {
        name: mutationName,
        args,
        fields: {
          name: "returning",
          fields: datas_fields,
        },
      },
    });
    return result?.[mutationName]?.returning;
  }

  /**
   * 根据 ID 删除单条数据 (对应graphql的mutation: delete_xxx_by_pk)
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如：{id:1}
   * @param params.args.id 主键值 必填 如: 1
   * @param params.data_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @returns 返回的数据
   */
  async delete_data_by_pk<DataFieldsType = DefaultDataFieldsType>(
    params: DeleteDataByPkParams
  ): Promise<DataFieldsType> {
    const { table, args, data_fields = "id" } = params;
    const operationName = `Delete${table}ById`;
    const mutationName = `delete_${table}_by_pk`;
    const result = await this.mutate<{ [key: string]: DataFieldsType }>({
      operationName,
      fields: {
        name: mutationName,
        args,
        fields: data_fields,
      },
    });
    return result?.[mutationName];
  }

  /**
   * 分页查询，并返回聚合数据
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.page 页码 默认: 1
   * @param params.pageSize 每页条数 默认: 10
   * @param params.args 参数详情 如: { where: { id: { _eq: 1 } } }
   * @param params.args.where 查询条件 必填 如: { id: { _eq: 1 } }
   * @param params.args.order_by 排序 如: { id: ()=>"asc" } }
   * @param params.args.distinct_on 去重 如: ()=>["id"]
   * @param params.datas_fields 需要返回的字段 默认: "id" 如: "id,name,email"
   * @param params.aggregate_fields 聚合字段 默认: "count" 如: "count"
   * @returns 返回的数据
   * @example
   * ```ts
   * const result = await this.find({
   *   table: "users",
   *   page: 1,
   *   pageSize: 10,
   *   args: {
   *     where: {
   *       id: { _eq: 1 },
   *     },
   *     order_by: {
   *       id: ()=>"asc",
   *     },
   *     distinct_on: ()=>["school"]
   *   },
   *   datas_fields: "id,name,email",
   *   aggregate_fields: "count",
   * });
   * console.log(result.list); // [{ id: 1, name: "John", email: "john@example.com" }]
   * console.log(result.aggregate); // { count: 1 }
   * ```
   */
  async find<
    DataFieldsType = DefaultDataFieldsType,
    AggregateFieldsType = DefaultAggregateFieldsType
  >(
    params: FindParams
  ): Promise<{ list: DataFieldsType[]; aggregate: AggregateFieldsType }> {
    const {
      table,
      page = 1,
      pageSize = 10,
      args,
      datas_fields = "id",
      aggregate_fields = "count",
    } = params;
    // 校验参数
    if (page < 1 || pageSize < 1) {
      throw new Error(
        `page 和 pageSize 不能小于1,page:${page},pageSize:${pageSize}`
      );
    }
    const offset = (page - 1) * pageSize;
    const listArgs = { ...args, limit: pageSize, offset };
    const aggregateArgs = { where: args?.where };
    const operationName = `Find${table}`;

    // 将两个查询合并为一个请求
    const result = await this.query<{
      list: DataFieldsType[];
      datas_aggregate: {
        aggregate: AggregateFieldsType;
      };
    }>({
      operationName,
      fields: [
        {
          alias: "list",
          name: table,
          args: listArgs,
          fields: datas_fields,
        },
        {
          alias: "datas_aggregate",
          name: `${table}_aggregate`,
          args: aggregateArgs,
          fields: {
            name: "aggregate",
            fields: aggregate_fields,
          },
        },
      ],
    });

    return {
      list: result?.list,
      aggregate: result?.datas_aggregate?.aggregate,
    };
  }

  /**
   * 执行聚合查询
   * @param params 入参对象
   * @param params.table 表名 必填 如: "users"
   * @param params.args 参数详情 如: { where: { id: { _eq: 1 } } }
   * @param params.aggregate_fields 聚合字段 默认: "count" 如: "count"
   * @returns 返回的数据
   * @example
   * ```ts
   * const result = await this.aggregate({
   *   table: "users",
   *   args: { where: { id: { _eq: 1 } } },
   *   aggregate_fields: "count",
   * });
   * console.log(result); // { count: 1 }
   * ```
   */
  async aggregate<AggregateFieldsType = DefaultAggregateFieldsType>(
    params: AggregateParams
  ): Promise<AggregateFieldsType> {
    const { table, args, aggregate_fields = "count" } = params;
    const operationName = `${table}Aggregate`;
    const queryName = `${table}_aggregate`;
    const result = await this.query<{
      datas_aggregate: { aggregate: AggregateFieldsType };
    }>({
      operationName,
      fields: {
        alias: "datas_aggregate",
        name: queryName,
        args,
        fields: {
          name: "aggregate",
          fields: aggregate_fields,
        },
      },
    });
    return result?.datas_aggregate?.aggregate;
  }
}

// 重新导出所有类型
export * from "../../types/client/extend-client/HasuraGraphqlClient";
export * from "../GraphQLClient";
