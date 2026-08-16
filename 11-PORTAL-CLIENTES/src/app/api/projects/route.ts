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

  if (user.role === 'admin') {
    const projects = await db.project.findMany({
      include: {
        client: { select: { id: true, companyName: true } },
        deliverables: true,
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(projects);
  }

  // Client: only their projects
  if (!user.clientId) return NextResponse.json([]);
  const projects = await db.project.findMany({
    where: { clientId: user.clientId },
    include: {
      client: { select: { id: true, companyName: true } },
      deliverables: { orderBy: { dueDate: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const project = await db.project.create({
    data: {
      clientId: body.clientId,
      title: body.title,
      description: body.description,
      status: body.status || 'Discovery',
      startDate: body.startDate ? new Date(body.startDate) : null,
      targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : null,
    },
    include: { client: { select: { id: true, companyName: true } } },
  });

  return NextResponse.json(project, { status: 201 });
}