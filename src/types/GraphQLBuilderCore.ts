// ============= GraphQL 操作相关类型  =============

/**
 * GraphQL 指令
 * @param name 指令名称，必填
 * @param args 指令参数，key为参数名，value为参数值，可选
 */
export interface GraphQLDirective {
  name: string;
  args?: unknown;
}

/**
 * GraphQL 字段定义
 * @param alias 别名，可选
 * @param name 字段名称，必填
 * @param args 字段参数，key为参数名，value为参数值，可选
 * @param directives 字段指令，可选
 * @param fields 字段嵌套，可选
 */
export interface GraphQLField {
  alias?: string;
  name: string;
  args?: unknown;
  directives?: GraphQLDirective[];
  fields?: GraphQLFields;
}

/**
 * GraphQL 字段类型（递归定义）
 */
export type GraphQLFields = string | GraphQLField | GraphQLFields[];

/**
 * GraphQL 操作
 * @param query 查询语句
 * @param variables 查询语句中实际使用的变量值，key为变量名，value为变量值，需要和 variableDefinitions 中的变量名一致，默认 {}；示例： {id:'123',email:'test@test.com'}
 * @param operationName 操作名称，默认 GeneratedOperation
 */
export interface GraphQLOperation {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

/**
 * 操作输入参数
 * @param operationType 操作类型 1.query 2.mutation 3.subscription，默认 query
 * @param operationName 操作名称 默认 GeneratedOperation
 * @param fields 需要返回的字段，默认 "__typename"；支持数组和对象和字符串相互嵌套，示例： ['id','name','email'] 或 'id name email' 或 ['id','name email',{alias:'avatar_image',name:'avatar',fields:['id','url']}] 或 {alias:'userinfo',name:'user',args:{where:{status:{_eq:'active'}}},fields:`id name email`}]
 * @param variableDefinitions 变量定义，key为变量名，以 $ 开头，value为变量类型；默认 {}；示例： {'$id':'ID!','$email':'String!'}
 * @param variables 变量值，key为变量名（不包含 $ 符号），value为变量值，需要和 variableDefinitions 中的变量名一致，默认 {}；示例： {id:'123',email:'test@test.com'}
 */
export interface OperationInput {
  operationType?: "query" | "mutation" | "subscription";
  operationName?: string;
  fields?: GraphQLFields;
  variableDefinitions?: Record<string, any>; // 变量定义（类型）
  variables?: Record<string, any>; // 实际变量值
}

/**
 * 操作结果
 * @param query 查询语句
 * @param variables 查询语句中实际使用的变量值，key为变量名，value为变量值
 */
export interface OperationResult {
  query: string;
  variables: Record<string, any>;
}
