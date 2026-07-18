import postgres from "postgres";
const connectionString = process.env.POSTGRES_URL!;

// Prevent multiple instances of prisma/postgres client in development
const globalForPostgres = global as unknown as {
  sql: postgres.Sql<Record<string, unknown>> | undefined;
};

export const sql =
  globalForPostgres.sql ||
  postgres(connectionString, {
    ssl: "require",
    max: 10, // Restrict the max pool size per serverless instance
    idle_timeout: 20, // Max number of seconds a connection can sit idle before closing
    connect_timeout: 30, // Timeout after 10 seconds if connection fails
  });

if (process.env.NODE_ENV !== "production") globalForPostgres.sql = sql;
