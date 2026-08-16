// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const now = new Date();

    // --- Core counts & totals ---
    const [totalClients, totalProjects, totalInvoices, revenueResult] = await Promise.all([
      db.client.count(),
      db.project.count(),
      db.invoice.count(),
      db.invoice.aggregate({
        where: { status: 'Paid' },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // --- Pending deliverables ---
    const pendingDeliverables = await db.deliverable.count({
      where: {
        status: { in: ['Pending', 'In Review'] },
        dueDate: { lte: new Date(now.getTime() + 14 * 86400000) },
      },
    });

    // --- Overdue invoices ---
    const overdueInvoices = await db.invoice.count({
      where: {
        status: { not: 'Paid' },
        dueDate: { lt: now },
      },
    });

    // --- Unread messages (for admin) ---
    const unreadMessages = await db.message.count({
      where: { isRead: false },
    });

    // --- Revenue by month (last 6 months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const paidInvoices = await db.invoice.findMany({
      where: {
        status: 'Paid',
        issueDate: { gte: sixMonthsAgo },
      },
      select: { issueDate: true, totalAmount: true },
    });

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const revenueMap = new Map<string, number>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueMap.set(key, 0);
    }

    for (const inv of paidInvoices) {
      const d = new Date(inv.issueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const current = revenueMap.get(key) || 0;
      revenueMap.set(key, current + inv.totalAmount);
    }

    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      revenueByMonth.push({
        month: label,
        revenue: Math.round((revenueMap.get(key) || 0) * 100) / 100,
      });
    }

    // --- Projects by status ---
    const projectsByStatusRaw = await db.project.groupBy({
      by: ['status'],
      _count: true,
    });

    const projectsByStatus = projectsByStatusRaw.map((p) => ({
      status: p.status,
      count: p._count,
    }));

    // --- Invoices by status (with totals) ---
    const invoicesByStatusRaw = await db.invoice.groupBy({
      by: ['status'],
      _count: true,
      _sum: { totalAmount: true },
    });

    const invoicesByStatus = invoicesByStatusRaw.map((inv) => ({
      status: inv.status,
      _count: inv._count,
      total: inv._sum.totalAmount || 0,
    }));

    // --- Recent activity (last 10) with user info ---
    const recentActivity = await db.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, title: true } },
      },
    });

    const activityUserIds = [...new Set(recentActivity.map((a) => a.userId))];
    const activityUsers = await db.user.findMany({
      where: { id: { in: activityUserIds } },
      select: { id: true, fullName: true, avatarUrl: true, role: true },
    });
    const userMap = new Map(activityUsers.map((u) => [u.id, u]));

    const recentActivityFormatted = recentActivity.map((a) => {
      const activityUser = userMap.get(a.userId);
      return {
        id: a.id,
        action: a.action,
        description: a.description,
        metadata: a.metadata,
        createdAt: a.createdAt.toISOString(),
        user: activityUser
          ? {
              id: activityUser.id,
              fullName: activityUser.fullName,
              avatarUrl: activityUser.avatarUrl,
              role: activityUser.role,
            }
          : null,
        project: a.project || null,
      };
    });

    // --- Top 5 clients by revenue ---
    const topClients = await db.client.findMany({
      orderBy: { totalRevenue: 'desc' },
      take: 5,
      select: {
        id: true,
        companyName: true,
        totalRevenue: true,
        healthScore: true,
        _count: { select: { projects: true } },
      },
    });

    const topClientsFormatted = topClients.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      totalRevenue: c.totalRevenue,
      healthScore: c.healthScore,
      projectCount: c._count.projects,
    }));

    // --- Deliverable completion rate ---
    const [totalDeliverables, completedDeliverables] = await Promise.all([
      db.deliverable.count(),
      db.deliverable.count({ where: { status: 'Approved' } }),
    ]);

    const deliverableCompletionRate =
      totalDeliverables > 0
        ? Math.round((completedDeliverables / totalDeliverables) * 10000) / 100
        : 0;

    return NextResponse.json({
      totalClients,
      totalProjects,
      totalInvoices,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingDeliverables,
      overdueInvoices,
      unreadMessages,
      revenueByMonth,
      projectsByStatus,
      invoicesByStatus,
      recentActivity: recentActivityFormatted,
      topClients: topClientsFormatted,
      deliverableCompletionRate,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Error al cargar el dashboard' },
      { status: 500 }
    );
  }
}
