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
    const invoices = await db.invoice.findMany({
      include: {
        client: { select: { id: true, companyName: true } },
        items: true,
      },
      orderBy: { issueDate: 'desc' },
    });
    return NextResponse.json(invoices);
  }

  if (!user.clientId) return NextResponse.json([]);
  const invoices = await db.invoice.findMany({
    where: { clientId: user.clientId },
    include: { items: true },
    orderBy: { issueDate: 'desc' },
  });
  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const totalAmount = body.items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0);

  const invoice = await db.invoice.create({
    data: {
      clientId: body.clientId,
      invoiceNumber: body.invoiceNumber,
      issueDate: new Date(body.issueDate),
      dueDate: new Date(body.dueDate),
      status: body.status || 'Draft',
      totalAmount,
      notes: body.notes,
      items: {
        create: body.items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: { client: { select: { id: true, companyName: true } }, items: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}