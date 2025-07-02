import {
  GraphQLFields,
  OperationInput,
  OperationResult,
} from "./types/GraphQLBuilderCore";

/**
 * GraphQL 核心抽象类
 * 负责 GraphQL 查询生成和基础操作抽象
 */
export abstract class GraphQLBuilderCore {
  constructor() {}
  /**
   * 生成 GraphQL 字段字符串
   * 支持递归嵌套、别名、参数、指令等完整 GraphQL 语法
   */
  private generateFields(fields: GraphQLFields, indent: string = ""): string {
    if (typeof fields === "undefined" || fields === null) {
      return "";
    } else if (typeof fields === "string") {
      return fields;
    } else if (Array.isArray(fields)) {
      return fields
        .map((field) => this.generateFields(field, indent).trim())
        .join("\n" + indent);
    } else if (typeof fields === "object") {
      let fieldString: string = "";

      // 处理字段名和别名
      if (fields.alias) {
        fieldString = `${fields.alias}: ${fields.name}`;
      } else {
        fieldString = `${fields.name}`;
      }

      // 处理参数
      if (fields.args && Object.keys(fields.args).length > 0) {
        fieldString += `(${this.serializeArguments(fields.args)})`;
      }

      // 处理指令
      if (fields.directives && fields.directives.length > 0) {
        fieldString += ` ${fields.directives
          .map((directive) =>
            this.serializeDirective({
              ...directive,
              args: directive.args as Record<string, any>,
            })
          )
          .join(" ")}`;
      }

      // 处理嵌套字段
      if (fields.fields) {
        fieldString += ` {\n${indent + "  "}${this.generateFields(
          fields.fields,
          indent + "  "
        )}\n${indent}}`;
      }

      return fieldString;
    } else {
      throw new Error("Invalid fields type");
    }
  }

  /**
   * 生成完整的 GraphQL 操作
   */
  private generateOperation(input: OperationInput): OperationResult {
    const {
      operationType = "query",
      operationName = "GeneratedOperation",
      variableDefinitions = {},
      fields = "__typename",
      variables = {},
    } = input;

    // 生成操作头部
    const operationHeader = this.generateOperationHeader(
      operationType,
      operationName,
      variableDefinitions
    );
    // 生成字段部分
    const fieldsString = this.generateFields(fields, "  ");

    // 组合完整查询
    const query = `${operationHeader} {\n  ${fieldsString}\n}`;

    // 提取实际使用的变量
    const usedVariables = this.extractUsedVariables(
      variableDefinitions,
      variables
    );

    return {
      query,
      variables: usedVariables,
    };
  }

  /**
   * 序列化参数
   */
  private serializeArguments(args: Record<string, any>): string {
    return Object.entries(args)
      .map(([key, value]) => `${key}: ${this.serializeValue(value)}`)
      .join(", ");
  }

  /**
   * 序列化指令
   */
  private serializeDirective(directive: {
    name: string;
    args?: Record<string, any>;
  }): string {
    let directiveString = `@${directive.name}`;
    if (directive.args && Object.keys(directive.args).length > 0) {
      directiveString += `(${this.serializeArguments(directive.args)})`;
    }
    return directiveString;
  }

  /**
   * 序列化值
   * 支持各种 GraphQL 数据类型
   */
  private serializeValue(
    value: any,
    isVariableReference: boolean = false
  ): string {
    if (typeof value === "undefined" || value === null) {
      return "null";
    } else if (typeof value === "string") {
      // 检查是否是变量引用
      return isVariableReference ? value : JSON.stringify(value);
    } else if (typeof value === "boolean" || typeof value === "number") {
      return value.toString();
    } else if (Array.isArray(value)) {
      return `[${value
        .map((item) => this.serializeValue(item, isVariableReference))
        .join(", ")}]`;
    } else if (typeof value === "function") {
      // 函数形式的变量引用
      return this.serializeValue(value(), true);
    } else if (typeof value === "object") {
      return `{${Object.entries(value)
        .map(
          ([key, val]) =>
            `${key}: ${this.serializeValue(val, isVariableReference)}`
        )
        .join(", ")}}`;
    }
    return JSON.stringify(value);
  }

  /**
   * 生成操作头部
   */
  private generateOperationHeader(
    operationType: string,
    operationName: string,
    variableDefinitions: Record<string, any>
  ): string {
    let header = operationType;
    if (operationName) {
      header += ` ${operationName}`;
    }

    if (Object.keys(variableDefinitions).length > 0) {
      const varDefs = Object.entries(variableDefinitions)
        .map(
          ([key, type]) => `${key.startsWith("$") ? key : "$" + key}: ${type}`
        )
        .join(", ");
      header += `(${varDefs})`;
    }

    return header;
  }

  /**
   * 提取实际使用的变量
   */
  private extractUsedVariables(
    variableDefinitions: Record<string, any>,
    variables: Record<string, any>
  ): Record<string, any> {
    const usedVariables: Record<string, any> = {};

    Object.keys(variableDefinitions).forEach((key) => {
      const varName = key.startsWith("$") ? key.slice(1) : key;
      if (variables.hasOwnProperty(varName)) {
        usedVariables[varName] = variables[varName];
      }
    });

    return usedVariables;
  }

  /**
   * 构建查询操作
   */
  protected buildQuery(
    input: Omit<OperationInput, "operationType">
  ): OperationResult {
    return this.generateOperation({ ...input, operationType: "query" });
  }

  /**
   * 构建变更操作
   */
  protected buildMutation(
    input: Omit<OperationInput, "operationType">
  ): OperationResult {
    return this.generateOperation({ ...input, operationType: "mutation" });
  }

  /**
   * 构建订阅操作
   */
  protected buildSubscription(
    input: Omit<OperationInput, "operationType">
  ): OperationResult {
    return this.generateOperation({ ...input, operationType: "subscription" });
  }
}

// 导出类型
export * from "./types/GraphQLBuilderCore";
