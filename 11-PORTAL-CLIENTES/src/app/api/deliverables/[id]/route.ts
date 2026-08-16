// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const deliverable = await db.deliverable.update({
    where: { id },
    data: { title: body.title, description: body.description, dueDate: body.dueDate ? new Date(body.dueDate) : undefined, status: body.status },
    include: { project: { select: { id: true, title: true } } },
  });

  return NextResponse.json(deliverable);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await db.deliverable.delete({ where: { id } });
  return NextResponse.json({ success: true });
}