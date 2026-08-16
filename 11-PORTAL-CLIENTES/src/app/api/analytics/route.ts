// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // --- Revenue by month (last 12 months) ---
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const paidInvoices = await db.invoice.findMany({
    where: {
      status: 'Paid',
      issueDate: { gte: twelveMonthsAgo },
      ...(user.role === 'client' && user.clientId ? { clientId: user.clientId } : {}),
    },
    select: { issueDate: true, totalAmount: true },
  });

  // Group by month
  const revenueByMonthMap = new Map<string, number>();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    revenueByMonthMap.set(key, 0);
    revenueByMonthMap.set(`label:${key}`, 0); // store label separately — we'll build final array differently
  }

  for (const inv of paidInvoices) {
    const d = new Date(inv.issueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const current = revenueByMonthMap.get(key) || 0;
    revenueByMonthMap.set(key, current + inv.totalAmount);
  }

  const revenueByMonth: { month: string; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    revenueByMonth.push({
      month: label,
      revenue: Math.round((revenueByMonthMap.get(key) || 0) * 100) / 100,
    });
  }

  // --- Projects by status ---
  const projectStatusFilter: Record<string, unknown> = {};
  if (user.role === 'client' && user.clientId) {
    projectStatusFilter.clientId = user.clientId;
  }

  const projectsByStatusRaw = await db.project.groupBy({
    by: ['status'],
    _count: true,
    where: projectStatusFilter,
  });

  const projectsByStatus = projectsByStatusRaw.map((p) => ({
    status: p.status,
    count: p._count,
  }));

  // --- Client health distribution ---
  const allClients = await db.client.findMany({
    select: { healthScore: true },
  });

  const healthRanges = [
    { range: 'Crítico (0-40)', min: 0, max: 40, count: 0 },
    { range: 'Bajo (41-60)', min: 41, max: 60, count: 0 },
    { range: 'Medio (61-80)', min: 61, max: 80, count: 0 },
    { range: 'Alto (81-100)', min: 81, max: 100, count: 0 },
  ];

  for (const c of allClients) {
    for (const r of healthRanges) {
      if (c.healthScore >= r.min && c.healthScore <= r.max) {
        r.count++;
        break;
      }
    }
  }

  const clientHealthDistribution = healthRanges.map((r) => ({
    range: r.range,
    count: r.count,
  }));

  // --- Deliverable completion rate ---
  const delFilter: Record<string, unknown> = {};
  if (user.role === 'client' && user.clientId) {
    delFilter.project = { clientId: user.clientId };
  }

  const [totalDeliverables, completedDeliverables] = await Promise.all([
    db.deliverable.count({ where: delFilter }),
    db.deliverable.count({ where: { ...delFilter, status: 'Approved' } }),
  ]);

  const deliverableCompletionRate = totalDeliverables > 0
    ? Math.round((completedDeliverables / totalDeliverables) * 10000) / 100
    : 0;

  return NextResponse.json({
    revenueByMonth,
    projectsByStatus,
    clientHealthDistribution,
    deliverableCompletionRate,
  });
}
