// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET: Notifications for current user, supports ?unreadOnly=true
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  const where: Record<string, unknown> = { userId: user.id };
  if (unreadOnly) where.read = false;

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      senderUser: { select: { id: true, fullName: true, company: true, avatarUrl: true } },
    },
  });

  const unreadCount = await db.notification.count({
    where: { userId: user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// POST: Create notification (admin only)
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });

  const body = await request.json();
  const { userId, title, content, type, link } = body;

  if (!userId || !title || !content) {
    return NextResponse.json({ error: 'Faltan campos obligatorios: userId, title, content' }, { status: 400 });
  }

  const notification = await db.notification.create({
    data: {
      senderId: user.id,
      userId,
      title,
      content,
      type: type || 'info',
      link: link || null,
    },
  });

  return NextResponse.json({ notification }, { status: 201 });
}

// PUT: Mark notifications as read
export async function PUT(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { ids } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Se requiere un array de ids' }, { status: 400 });
  }

  const result = await db.notification.updateMany({
    where: { id: { in: ids }, userId: user.id },
    data: { read: true },
  });

  return NextResponse.json({ updated: result.count });
}
