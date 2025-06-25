// 导出核心客户端
import { GraphQLClient } from "./GraphQLClient";
export type {
  // GraphQLClient
  GraphQLClientConfig,
  RequestConfig,
  RequestResponse,
  RequestListener,
  RequestLifecycle,
  // GraphQLBuilderCore
  GraphQLFields,
  GraphQLOperation,
  OperationInput,
  OperationResult,
} from "./GraphQLClient";

// 导出扩展客户端
import { HasuraGraphqlClient } from "./extend-client/HasuraGraphqlClient";
export type {
  // HasuraGraphqlClient
  DataByPkParams,
  DataParams,
  DatasParams,
  InsertDataOneParams,
  InsertDatasParams,
  UpdateDataByPkParams,
  UpdateDatasParams,
  UpdateDatasManyParams,
  DeleteDatasParams,
  DeleteDataByPkParams,
  FindParams,
  AggregateParams,
  // 公共参数
  QueryArgs,
  AggregateArgs,
  UpdateDataByPkArgs,
  UpdateDatasArgs,
  UpdateDatasManyArgs,
  DeleteDatasArgs,
  InsertDataOneArgs,
  InsertDatasArgs,
} from "./extend-client/HasuraGraphqlClient";

// 最终导出
export { GraphQLClient, HasuraGraphqlClient };
export default {
  GraphQLClient: GraphQLClient,
  HasuraGraphqlClient: HasuraGraphqlClient,
};
