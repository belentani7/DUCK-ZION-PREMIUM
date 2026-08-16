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

  if (user.role !== 'admin' && user.clientId !== id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const client = await db.client.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, fullName: true, company: true, avatarUrl: true } },
      projects: { include: { deliverables: true }, orderBy: { createdAt: 'desc' } },
      invoices: { include: { items: true }, orderBy: { issueDate: 'desc' } },
      _count: { select: { projects: true, invoices: true } },
    },
  });

  if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const client = await db.client.update({
    where: { id },
    data: { companyName: body.companyName, contactEmail: body.contactEmail, phone: body.phone, notes: body.notes },
    include: { user: { select: { id: true, email: true, fullName: true, company: true } } },
  });

  return NextResponse.json(client);
}