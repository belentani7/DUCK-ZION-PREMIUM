// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET: Activities — admin sees all, client sees their own
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientIdParam = searchParams.get('clientId');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  const where: Record<string, unknown> = {};

  if (user.role === 'client' && user.clientId) {
    where.clientId = user.clientId;
  } else if (user.role === 'admin' && clientIdParam) {
    where.clientId = clientIdParam;
  }

  const activities = await db.activity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
    include: {
      project: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ activities });
}
