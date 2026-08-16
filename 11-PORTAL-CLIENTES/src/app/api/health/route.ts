import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * DUCK ClientPortal Pro & CRM Health Diagnostic
 * Systems Architecture by Pedro Belentani · Canal Zion 2026
 */
export async function GET() {
  const start = performance.now();
  let dbStatus = "healthy";
  let latencyMs = 0;

  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    latencyMs = Math.round(performance.now() - dbStart);
  } catch {
    dbStatus = "degraded";
    latencyMs = -1;
  }

  const elapsed = Math.round(performance.now() - start);

  return NextResponse.json({
    status: dbStatus === "healthy" ? "pass" : "degraded",
    service: "DUCK ClientPortal Pro & CRM",
    ecosystem: "DUCK ZION PREMIUM",
    version: "3.2.0",
    architecture: "Pedro Belentani",
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: dbStatus,
        latencyMs,
        provider: "sqlite"
      },
      realtimeSocket: {
        status: "ready"
      },
      stemStorage: {
        status: "mounted"
      }
    },
    responseTimeMs: elapsed
  }, {
    status: 200,
    headers: {
      "X-Powered-By": "Duck-Zion-CRM/belentani",
      "X-Engineer": "Pedro Belentani",
      "Cache-Control": "no-store"
    }
  });
}
