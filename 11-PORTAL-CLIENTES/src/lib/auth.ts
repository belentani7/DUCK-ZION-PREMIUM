// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { db } from '@/lib/db';
import { randomBytes } from 'node:crypto';

// Token-based session storage (in-memory for demo)
const sessions = new Map<string, { userId: string; role: string; expires: number }>();

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function createSession(userId: string, role: string): string {
  const token = generateToken();
  sessions.set(token, { userId, role, expires: Date.now() + 86400000 });
  return token;
}

export function getSession(token: string): { userId: string; role: string } | null {
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { userId: session.userId, role: session.role };
}

export async function getCurrentUser(token: string | null | undefined) {
  if (!token) return null;
  const session = getSession(token);
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { client: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    company: user.company,
    avatarUrl: user.avatarUrl,
    clientId: user.client?.id,
  };
}

export function destroySession(token: string) {
  sessions.delete(token);
}
