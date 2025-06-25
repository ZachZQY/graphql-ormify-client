import { HasuraGraphqlClient } from "../src/client/extend-client/HasuraGraphqlClient";

const hasuraClient = new HasuraGraphqlClient({
  endpoint: "https://guide-hasura-graphql.gzdyguide.net/v1/graphql",
  headers: { "x-hasura-admin-secret": "myadminsecretkey" },
  debug: true,
});

async function main() {
  const result = await hasuraClient.update_data_by_pk({
    table: "data_cache",
    args: {
      pk_columns: {
        id: 1,
      },
      _set: {
        key: "111222",
      },
    },

    data_fields: "id created_at key",
  });

  console.log(result);
}

main();
