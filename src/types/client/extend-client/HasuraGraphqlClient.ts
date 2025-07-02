// Hasura GraphQL Engine 类型定义
// 完全参照 Hasura 的类型名称和结构

import { GraphQLField, GraphQLFields } from "../../GraphQLBuilderCore";

interface DataField extends GraphQLField {
  args?: QueryArgs;
  fields?: DataFields;
}

export type DataFields = string | DataField | DataFields[];

// ============================================================================
// 基础类型
// ============================================================================

// 表名类型
export type TableName = string;

// 字段名类型
export type FieldName = string;

// 主键类型
export type PrimaryKey = string | number;

// 字段类型
export type FieldType =
  | string
  | number
  | boolean
  | null
  | Record<string, any>
  | FieldType[];

// 排序方向
export type order_by =
  | "asc" // 升序
  | "desc" // 降序
  | "asc_nulls_first" // 升序 空值在前
  | "asc_nulls_last" // 升序 空值在后
  | "desc_nulls_first" // 降序 空值在前
  | "desc_nulls_last"; // 降序 空值在后

// ============================================================================
// 比较操作符 (对应 Hasura 的比较操作符)
// ============================================================================
/**
 * 比较操作符 (对应 Hasura 的比较操作符)
 * 1. _eq: 等于
 * 2. _neq: 不等于
 * 3. _gt: 大于
 * 4. _gte: 大于等于
 * 5. _lt: 小于
 * 6. _lte: 小于等于
 * 7. _in: 在数组中
 * 8. _nin: 不在数组中
 * 9. _is_null: 是否为空
 * 10. _like: LIKE 匹配
 * 11. _nlike: NOT LIKE 匹配
 * 12. _ilike: ILIKE 匹配 (不区分大小写)
 * 13. _nilike: NOT ILIKE 匹配
 * 14. _similar: SIMILAR TO 匹配
 * 15. _nsimilar: NOT SIMILAR TO 匹配
 */
export interface ComparisonOperator {
  _eq?: any; // 等于
  _neq?: any; // 不等于
  _gt?: any; // 大于
  _gte?: any; // 大于等于
  _lt?: any; // 小于
  _lte?: any; // 小于等于
  _in?: any[]; // 在数组中
  _nin?: any[]; // 不在数组中
  _is_null?: boolean; // 是否为空
  _like?: string; // LIKE 匹配
  _nlike?: string; // NOT LIKE 匹配
  _ilike?: string; // ILIKE 匹配 (不区分大小写)
  _nilike?: string; // NOT ILIKE 匹配
  _similar?: string; // SIMILAR TO 匹配
  _nsimilar?: string; // NOT SIMILAR TO 匹配
  // 数组操作符
  _contains?: string; // 包含
  _contained_in?: string; // 包含在数组中
  _contains_key?: string; // 包含键
  _contained_in_key?: string; // 包含在键中
  _has_key?: string; // 包含键
  _has_key_any?: string; // 包含键
  _has_key_all?: string; // 包含键
}

// ============================================================================
// 逻辑操作符 (对应 Hasura 的逻辑操作符)
// ============================================================================
/**
 * 逻辑操作符 (对应 Hasura 的逻辑操作符)
 * 1. _and: AND 逻辑
 * 2. _or: OR 逻辑
 * 3. _not: NOT 逻辑
 */
export interface LogicalOperator {
  _and?: table_bool_exp[]; // AND 逻辑
  _or?: table_bool_exp[]; // OR 逻辑
  _not?: table_bool_exp; // NOT 逻辑
}

// ============================================================================
// Where 条件 (对应 table_bool_exp)
// ============================================================================

export type table_bool_exp =
  | ComparisonOperator
  | LogicalOperator
  | { [field: string]: table_bool_exp };

// ============================================================================
// 排序相关类型
// ============================================================================

/**
 * 排序字段 (对应 table_order_by)
 * 1. field: 字段，如：'id'
 * 2. order_by: 排序方式，如：() => 'asc'
 */
export interface field_order_by {
  [field: string]: () => order_by;
}
export type table_order_by = field_order_by | field_order_by[];

// 去重相关
export type table_select_column = () => string | string[];

/**
 * 冲突相关
 * 1. constraint: 约束，如：() => 'users_pkey'
 * 2. update_columns: 更新字段，如：() => ['name']
 * 3. where: 条件，如：{ id: { _eq: 1 } }
 */
export interface table_on_conflict {
  constraint: () => string;
  update_columns: () => string;
  where?: table_bool_exp;
}

// table_pk_columns_input
export interface table_pk_columns_input {
  [field: string]: PrimaryKey;
}

// table_arr_rel_insert_input
export interface table_arr_rel_insert_input {
  data: table_insert_input;
  on_conflict?: table_on_conflict;
}

// table_insert_input
export interface table_insert_input {
  [field: string]: table_arr_rel_insert_input | FieldType;
}

// ============================================================================
// 公共参数类型
// ============================================================================

/**
 * 查询参数 (对应 table_select_column, table_bool_exp, table_order_by 等)
 * 1. where: 条件，如：{ id: { _eq: 1 } }
 * 2. distinct_on: 去重字段，如：()=>['id']
 * 3. limit: 限制条数，如：10
 * 4. offset: 偏移量，如：10
 * 5. order_by: 排序，如：{ id: () => 'asc' }
 */
export interface QueryArgs {
  where?: table_bool_exp; // table_bool_exp
  distinct_on?: table_select_column; // [table_select_column!]
  limit?: number; // Int
  offset?: number; // Int
  order_by?: table_order_by; // [table_order_by!]
}

/**
 * 更新操作符 (对应 table_set_input, table_inc_input 等)
 * 1. _set: 设置字段值，如：{ name: 'John' }
 * 2. _inc: 增加字段值，如：{ age: 1 }
 * 3. _append: 追加字段值，如：{ hobbies: ['reading'] }
 * 4. _prepend: 前置字段值，如：{ hobbies: ['reading'] }
 * 5. _delete_key: 删除字段值，如：{ hobbies: ['reading'] }
 * 6. _delete_elem: 删除元素值，如：{ hobbies: ['reading'] }
 */
export interface UpdateArgs {
  _set?: Record<string, any>; // table_set_input
  _inc?: Record<string, number>; // table_inc_input
  _append?: Record<string, any>; // table_append_input
  _prepend?: Record<string, any>; // table_prepend_input
  _delete_key?: Record<string, string[]>; // table_delete_key_input
  _delete_elem?: Record<string, number>; // table_delete_elem_input
}

/**
 * 聚合查询参数 (对应 table_aggregate_bool_exp)
 * 1. where: 条件，如：{ id: { _eq: 1 } }
 * 2. distinct_on: 去重字段，如：()=>'id'
 */
export interface AggregateArgs {
  where?: table_bool_exp; // table_bool_exp
  distinct_on?: table_select_column; // [table_select_column!]
}

// ============================================================================
// 插入相关类型
// ============================================================================

/**
 * 单条插入参数 (对应 table_insert_input!)
 * 1. object: 插入数据，如：{ name: 'John' }
 * 2. on_conflict: 冲突处理，如：{ constraint: () => 'users_pkey', update_columns: () => ['name'] }
 */
export interface InsertDataOneArgs {
  object: table_insert_input; // table_insert_input!
  on_conflict?: table_on_conflict;
}

/**
 * 批量插入参数 (对应 [table_insert_input!]!)
 * 1. objects: 插入数据，如：[{ name: 'John' }，{name:"zac",user_reviews:{data:{name:"zac"}}}]
 * 2. on_conflict: 冲突处理，如：{ constraint: () => 'users_pkey', update_columns: () => ['name'] }
 */
export interface InsertDatasArgs {
  objects: table_insert_input[]; // [table_insert_input!]!
  on_conflict?: table_on_conflict;
}

// ============================================================================
// 更新相关类型
// ============================================================================

// 根据主键更新参数 (对应 table_pk_columns_input!, table_set_input 等)
export interface UpdateDataByPkArgs extends UpdateArgs {
  pk_columns: table_pk_columns_input; // table_pk_columns_input!
}

// 根据条件更新参数 (对应 table_bool_exp!, table_set_input 等)
export interface UpdateDatasArgs extends UpdateArgs {
  where: table_bool_exp; // table_bool_exp!
}

// 批量更新参数 (对应 [table_updates!]!)
export interface UpdateDatasManyArgs {
  updates: ({
    where: table_bool_exp;
  } & UpdateArgs)[]; // [table_updates!]!
}

// ============================================================================
// 删除相关类型
// ============================================================================

// 条件删除参数 (对应 table_bool_exp!)
export interface DeleteDatasArgs {
  where: table_bool_exp; // table_bool_exp!
}

// ============================================================================
// 聚合相关类型
// ============================================================================

/**
 * 聚合字段说明
 * 1. count: 计数
 * 2. sum: 求和
 * 3. avg: 平均值
 * 4. max: 最大值
 * 5. min: 最小值
 * 6. stddev: 标准差
 * 7. stddev_pop: 总体标准差
 * 8. stddev_samp: 样本标准差
 * 9. var_pop: 总体方差
 * 10. var_samp: 样本方差
 * 11. variance: 方差
 */
export type AggregateFields = GraphQLFields | "count";

// ============================================================================
// 客户端参数类型
// ============================================================================

/**
 * 根据 ID 获取单条数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ id: 1 }
 * 3. data_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * {
 *  id: 1,
 *  name: 'John'
 * }
 */
export interface DataByPkParams {
  table: TableName;
  args: {
    id: PrimaryKey;
  };
  data_fields: DataFields; // GraphQLFields
}

/**
 * 根据条件获取多条数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ where: { id: { _eq: 1 } } }
 * 3. datas_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * [
 *  {
 *    id: 1,
 *    name: 'John'
 *  }
 * ]
 */
export interface DatasParams<
  DataFieldsType extends GraphQLFields = DataFields,
  ArgsType extends Record<string, any> = QueryArgs
> {
  table: TableName;
  args?: ArgsType;
  datas_fields: DataFieldsType; // GraphQLFields
}

/**
 * 根据条件获取单条数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ where: { id: { _eq: 1 } } }
 * 3. data_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * {
 *  id: 1,
 *  name: 'John'
 * }
 */
export interface DataParams {
  table: TableName;
  args?: QueryArgs;
  data_fields: DataFields; // GraphQLFields
}

/**
 * 插入单条数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ object: { name: 'John' } }
 * 3. data_fields: 返回字段，如：['id', 'name']
 */
export interface InsertDataOneParams {
  table: TableName;
  args: InsertDataOneArgs;
  data_fields: DataFields; // GraphQLFields
}

/**
 * 批量插入数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ objects: [{ name: 'John' }, { name: 'Jane' }] }
 * 3. datas_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * [
 *  {
 *    id: 1,
 *    name: 'John'
 *  }
 * ]
 */
export interface InsertDatasParams {
  table: TableName;
  args: InsertDatasArgs;
  datas_fields: DataFields; // GraphQLFields
}

/**
 * 根据主键更新单条数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ _set: { name: 'John' }, pk_columns: { id: 1 } }
 * 2. args.pk_columns: 主键字段，如：{ id: 1 }
 * 2. args._set: 更新数据，如：{ name: 'John' }
 * 3. data_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * {
 *  id: 1,
 *  name: 'John'
 * }
 */
export interface UpdateDataByPkParams {
  table: TableName;
  args: UpdateDataByPkArgs;
  data_fields?: DataFields; // GraphQLFields
}

/**
 * 根据条件批量更新数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ where: { id: { _eq: 1 } } }
 * 3. datas_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * [
 *  {
 *    id: 1,
 *    name: 'John'
 *  }
 * ]
 */
export interface UpdateDatasParams {
  table: TableName;
  args: UpdateDatasArgs;
  datas_fields?: DataFields; // GraphQLFields
}

/**
 * 批量更新多条数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ updates: [{ where: { id: { _eq: 1 } }, _set: { name: 'John' } }] }
 * 3. datas_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * [
 *  {
 *    id: 1,
 *    name: 'John'
 *  }
 * ]
 */
export interface UpdateDatasManyParams {
  table: TableName;
  args: UpdateDatasManyArgs;
  datas_fields?: DataFields; // GraphQLFields
}

/**
 * 根据条件删除数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ where: { id: { _eq: 1 } } }
 * 3. data_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * [
 *  {
 *    id: 1,
 *    name: 'John'
 *  }
 * ]
 */
export interface DeleteDatasParams {
  table: TableName;
  args: DeleteDatasArgs;
  datas_fields?: DataFields; // GraphQLFields
}

/**
 * 根据 ID 删除单条数据参数
 * 1. table: 表名，如：users
 * 2. args: 参数，如：{ id: 1 }
 * 3. data_fields: 返回字段，如：['id', 'name']
 *
 * 示例结果：
 * {
 *  id: 1,
 *  name: 'John'
 * }
 */
export interface DeleteDataByPkParams {
  table: TableName;
  args: {
    id: PrimaryKey;
  };
  data_fields: DataFields; // GraphQLFields
}

/**
 * 分页查询参数
 * 1. table: 表名，如：users
 * 2. page: 页码，如：1
 * 3. pageSize: 每页条数，如：10
 * 4. args: 查询参数，如：{ where: { id: { _eq: 1 } } }
 * 5. datas_fields: 查询字段，如：['id', 'name']
 * 6. aggregate_fields: 聚合字段，如：['count',"sum{score}"]
 *
 * 示例结果：
 * {
 *  list: [
 *    {
 *      id: 1,
 *      name: 'John'
 *    }
 *  ],
 *  aggregate: {
 *    count: 100
 *    sum: {
 *      score: 100
 *    }
 *  }
 * }
 */
export interface FindParams {
  table: TableName;
  page?: number;
  pageSize?: number;
  args?: QueryArgs;
  datas_fields?: DataFields; // GraphQLFields
  aggregate_fields?: AggregateFields; // GraphQLFields
}

/**
 * 聚合查询参数
 * 1. table: 表名，如：users
 * 2. args: 聚合查询参数，如：{ where: { id: { _eq: 1 } } }
 * 3. aggregate_fields: 聚合字段，如：['count',"sum{score}"]
 *
 * 示例结果：
 * {
 *  count: 100
 *  sum: {
 *    score: 100
 *  }
 * }
 */
export interface AggregateParams {
  table: TableName;
  args?: AggregateArgs;
  aggregate_fields?: AggregateFields; // GraphQLFields
}
