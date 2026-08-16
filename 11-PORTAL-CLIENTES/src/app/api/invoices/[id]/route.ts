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
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true, contactEmail: true, phone: true } },
      items: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!invoice) return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });

  if (user.role !== 'admin' && user.clientId !== invoice.clientId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  return NextResponse.json(invoice);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const invoice = await db.invoice.update({
    where: { id },
    data: {
      status: body.status,
      notes: body.notes,
    },
    include: { client: { select: { id: true, companyName: true } }, items: true },
  });

  return NextResponse.json(invoice);
}