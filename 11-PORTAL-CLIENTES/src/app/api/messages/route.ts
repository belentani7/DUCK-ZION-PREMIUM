// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const otherUserId = searchParams.get('otherUserId');
  const projectId = searchParams.get('projectId');

  const where: Record<string, unknown> = {};
  if (user.role === 'client') {
    where.OR = [
      { senderId: user.id, recipientId: user.id },
      { senderId: user.id, recipientId: { not: user.id } },
      { senderId: { not: user.id }, recipientId: user.id },
    ];
  } else if (otherUserId) {
    where.OR = [
      { senderId: user.id, recipientId: otherUserId },
      { senderId: otherUserId, recipientId: user.id },
    ];
  }

  if (projectId) {
    where.projectId = projectId;
  }

  const messages = await db.message.findMany({
    where,
    include: {
      sender: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
      recipient: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();

  // Get admin user for client messages
  let recipientId = body.recipientId;
  if (!recipientId && user.role === 'client') {
    const admin = await db.user.findFirst({ where: { role: 'admin' }, select: { id: true } });
    if (admin) recipientId = admin.id;
  }

  const message = await db.message.create({
    data: {
      senderId: user.id,
      recipientId: recipientId || user.id,
      projectId: body.projectId || null,
      content: body.content,
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
      recipient: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
      project: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (body.messageIds && Array.isArray(body.messageIds)) {
    await db.message.updateMany({
      where: { id: { in: body.messageIds }, recipientId: user.id },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}