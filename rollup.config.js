import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default [
  // 主要的 graphql-ormify-client 打包
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/graphql-ormify-client.mjs",
        format: "es",
        exports: "named",
        sourcemap: true,
      },
      {
        file: "dist/graphql-ormify-client.cjs",
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: "dist/graphql-ormify-client.umd.js",
        format: "umd",
        name: "GraphQLOrmifyClient",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      terser(),
    ],
  },
];
