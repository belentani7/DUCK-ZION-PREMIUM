// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { db } from '@/lib/db';
import { hash, compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;

  if (action === 'login') {
    const { email, password } = await request.json();
    const user = await db.user.findUnique({ where: { email }, include: { client: true } });
    if (!user) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

    const valid = await compare(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

    const token = createSession(user.id, user.role);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        company: user.company,
        avatarUrl: user.avatarUrl,
        clientId: user.client?.id,
      },
    });
  }

  if (action === 'signup') {
    const { email, password, fullName, company } = await request.json();

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });

    const hashedPassword = await hash(password, 10);
    const user = await db.user.create({
      data: { email, password: hashedPassword, fullName: fullName || '', company: company || '', role: 'client' },
    });

    const client = await db.client.create({
      data: {
        userId: user.id,
        companyName: company || email.split('@')[0],
        contactEmail: email,
      },
    });

    const token = createSession(user.id, user.role);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        company: user.company,
        clientId: client.id,
      },
    });
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
}