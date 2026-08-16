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
  const projectId = searchParams.get('projectId');

  if (user.role === 'admin') {
    const where = projectId ? { projectId } : {};
    const deliverables = await db.deliverable.findMany({
      where,
      include: { project: { select: { id: true, title: true, client: { select: { companyName: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json(deliverables);
  }

  if (!user.clientId) return NextResponse.json([]);
  const projects = await db.project.findMany({ where: { clientId: user.clientId }, select: { id: true } });
  const projectIds = projects.map(p => p.id);
  const where = projectId ? { projectId, project: { id: { in: projectIds } } } : { projectId: { in: projectIds } };

  const deliverables = await db.deliverable.findMany({
    where,
    include: { project: { select: { id: true, title: true } } },
    orderBy: { dueDate: 'asc' },
  });
  return NextResponse.json(deliverables);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const deliverable = await db.deliverable.create({
    data: {
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      dueDate: new Date(body.dueDate),
      status: body.status || 'Pending',
    },
    include: { project: { select: { id: true, title: true } } },
  });

  return NextResponse.json(deliverable, { status: 201 });
}