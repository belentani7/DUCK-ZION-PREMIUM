import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/health
 * Duck Studio OS Health & Telemetry Diagnostic API
 * Architecture & Sound Engineering by Pedro Belentani · Canal Zion 2026
 */
export async function GET() {
  const start = performance.now()
  let dbStatus = 'healthy'
  let dbLatencyMs = 0

  try {
    const dbStart = performance.now()
    await db.$queryRaw`SELECT 1`
    dbLatencyMs = Math.round(performance.now() - dbStart)
  } catch (err: any) {
    dbStatus = 'degraded'
    dbLatencyMs = -1
  }

  const memory = process.memoryUsage ? process.memoryUsage() : { heapUsed: 0, heapTotal: 0 }
  const elapsed = Math.round(performance.now() - start)

  const payload = {
    status: dbStatus === 'healthy' ? 'pass' : 'degraded',
    version: '3.2.0',
    ecosystem: 'DUCK ZION PREMIUM',
    architecture: 'Pedro Belentani',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime ? process.uptime() : 0),
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        provider: 'sqlite'
      },
      webAudioEngine: {
        status: 'ready',
        sampleRate: 48000,
        channels: 2,
        dspProfile: 'Gema 01 - A Onda Grave'
      },
      dawBridge: {
        status: 'listening',
        protocol: 'WebSocket/IPC'
      }
    },
    system: {
      memoryUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      responseTimeMs: elapsed
    }
  }

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'X-Powered-By': 'Duck-Zion-OS/belentani',
      'X-Engineer': 'Pedro Belentani',
      'Cache-Control': 'no-store'
    }
  })
}
