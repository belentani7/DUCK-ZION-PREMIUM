// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true, contactEmail: true, phone: true } },
      deliverables: { orderBy: { dueDate: 'asc' } },
    },
  });

  if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

  // Client can only see their own projects
  if (user.role !== 'admin' && user.clientId !== project.clientId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  return NextResponse.json(project);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

    const updateData: Record<string, unknown> = {
      startDate: body.startDate ? new Date(body.startDate) : null,
      targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : null,
    };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.progress !== undefined) updateData.progress = body.progress;

  const project = await db.project.update({
    where: { id },
    data: updateData,
    include: { client: { select: { id: true, companyName: true } }, deliverables: true },
  });

  return NextResponse.json(project);
}