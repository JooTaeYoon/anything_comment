import { NextResponse } from "next/server";

import { ensureSiteMetricsTable, sql } from "@/lib/db";

const VISIT_KEY = "home_visits";

type MetricRow = {
  metric_value: string | number;
};

function toCount(row?: MetricRow) {
  if (!row) {
    return 0;
  }

  return Number(row.metric_value);
}

export async function GET() {
  try {
    await ensureSiteMetricsTable();

    const [metric] = (await sql`
      SELECT metric_value
      FROM site_metrics
      WHERE metric_key = ${VISIT_KEY}
    `) as MetricRow[];

    return NextResponse.json({ count: toCount(metric) });
  } catch (error) {
    console.error("Failed to fetch visit count:", error);

    return NextResponse.json(
      { message: "방문자 수를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    await ensureSiteMetricsTable();

    const [metric] = (await sql`
      INSERT INTO site_metrics (metric_key, metric_value)
      VALUES (${VISIT_KEY}, 1)
      ON CONFLICT (metric_key)
      DO UPDATE SET metric_value = site_metrics.metric_value + 1
      RETURNING metric_value
    `) as MetricRow[];

    return NextResponse.json({ count: toCount(metric) });
  } catch (error) {
    console.error("Failed to increase visit count:", error);

    return NextResponse.json(
      { message: "방문자 수를 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}
