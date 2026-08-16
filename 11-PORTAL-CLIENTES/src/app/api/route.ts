// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "ClientPortal Pro",
    status: "ok",
    version: "0.2.0",
    timestamp: new Date().toISOString(),
  });
}
