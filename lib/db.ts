import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.");
}

export const sql = neon(databaseUrl);

export async function ensureBoardsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS boards (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function ensureSiteMetricsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_metrics (
      metric_key TEXT PRIMARY KEY,
      metric_value BIGINT NOT NULL DEFAULT 0
    )
  `;
}
