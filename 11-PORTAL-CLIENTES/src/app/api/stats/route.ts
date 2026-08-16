// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  if (user.role === 'admin') {
    const [
      totalClients,
      totalProjects,
      totalInvoices,
      totalRevenue,
      pendingDeliverables,
      unreadMessages,
      overdueInvoices,
    ] = await Promise.all([
      db.client.count(),
      db.project.count(),
      db.invoice.count(),
      db.invoice.aggregate({ where: { status: 'Paid' }, _sum: { totalAmount: true } }),
      db.deliverable.count({ where: { status: { in: ['Pending', 'In Review'] } } }),
      db.message.count({ where: { isRead: false, recipientId: user.id } }),
      db.invoice.count({ where: { status: 'Overdue' } }),
    ]);

    const invoicesByStatus = await db.invoice.groupBy({
      by: ['status'],
      _count: true,
    });

    const projectsByStatus = await db.project.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      totalClients,
      totalProjects,
      totalInvoices,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingDeliverables,
      unreadMessages,
      overdueInvoices,
      invoicesByStatus,
      projectsByStatus,
    });
  }

  // Client stats
  if (!user.clientId) return NextResponse.json({});
  const [
    totalProjects,
    pendingDeliverables,
    unpaidInvoices,
    totalOwed,
    unreadMessages,
  ] = await Promise.all([
    db.project.count({ where: { clientId: user.clientId } }),
    db.deliverable.count({
      where: {
        status: { in: ['Pending', 'In Review'] },
        project: { clientId: user.clientId },
      },
    }),
    db.invoice.count({
      where: { clientId: user.clientId, status: { in: ['Draft', 'Sent', 'Overdue'] } },
    }),
    db.invoice.aggregate({
      where: { clientId: user.clientId, status: { in: ['Draft', 'Sent', 'Overdue'] } },
      _sum: { totalAmount: true },
    }),
    db.message.count({ where: { isRead: false, recipientId: user.id } }),
  ]);

  return NextResponse.json({
    totalProjects,
    pendingDeliverables,
    unpaidInvoices,
    totalOwed: totalOwed._sum.totalAmount || 0,
    unreadMessages,
  });
}