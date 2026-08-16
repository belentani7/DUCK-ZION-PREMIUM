// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const clients = await db.client.findMany({
    include: {
      user: { select: { id: true, email: true, fullName: true, company: true, avatarUrl: true } },
      _count: { select: { projects: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { companyName, contactEmail, phone, notes, fullName, email, password } = body;

  // Create user if provided
  let userId = body.userId;
  if (email && password) {
    const { hash } = await import('bcryptjs');
    const hashedPassword = await hash(password, 10);
    const newUser = await db.user.create({
      data: { email, password: hashedPassword, fullName: fullName || companyName, company: companyName, role: 'client' },
    });
    userId = newUser.id;
  }

  if (!userId) return NextResponse.json({ error: 'Se requiere un usuario' }, { status: 400 });

  const client = await db.client.create({
    data: { userId, companyName, contactEmail, phone, notes },
    include: { user: { select: { id: true, email: true, fullName: true, company: true } } },
  });

  return NextResponse.json(client, { status: 201 });
}