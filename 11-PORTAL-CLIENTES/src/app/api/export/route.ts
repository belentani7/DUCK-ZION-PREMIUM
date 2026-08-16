// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type ExportType = 'clients' | 'projects' | 'invoices';
type ExportFormat = 'csv' | 'json';

function escapeCSV(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSVRow(headers: string[], row: Record<string, unknown>): string {
  return headers.map((h) => escapeCSV(row[h])).join(',');
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as ExportType;
  const format = (searchParams.get('format') || 'json') as ExportFormat;

  if (!type || !['clients', 'projects', 'invoices'].includes(type)) {
    return NextResponse.json(
      { error: 'Tipo de exportación inválido. Usa: clients, projects, invoices' },
      { status: 400 }
    );
  }

  if (!['csv', 'json'].includes(format)) {
    return NextResponse.json(
      { error: 'Formato inválido. Usa: csv, json' },
      { status: 400 }
    );
  }

  try {
    if (type === 'clients') {
      const clients = await db.client.findMany({
        select: {
          companyName: true,
          contactEmail: true,
          phone: true,
          healthScore: true,
          churnRisk: true,
          totalRevenue: true,
        },
        orderBy: { companyName: 'asc' },
      });

      if (format === 'json') {
        return NextResponse.json(clients);
      }

      const headers = ['companyName', 'contactEmail', 'phone', 'healthScore', 'churnRisk', 'totalRevenue'];
      const csvRows = [
        'Company Name,Contact Email,Phone,Health Score,Churn Risk,Total Revenue',
        ...clients.map((c) => toCSVRow(headers, c as unknown as Record<string, unknown>)),
      ];
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="clients-export.csv"',
        },
      });
    }

    if (type === 'projects') {
      const projects = await db.project.findMany({
        select: {
          title: true,
          status: true,
          priority: true,
          progress: true,
          startDate: true,
          targetEndDate: true,
          client: { select: { companyName: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const flat = projects.map((p) => ({
        title: p.title,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        clientName: p.client.companyName,
        startDate: p.startDate ? p.startDate.toISOString() : '',
        targetEndDate: p.targetEndDate ? p.targetEndDate.toISOString() : '',
      }));

      if (format === 'json') {
        return NextResponse.json(flat);
      }

      const headers = ['title', 'status', 'priority', 'progress', 'clientName', 'startDate', 'targetEndDate'];
      const csvRows = [
        'Title,Status,Priority,Progress,Client,Start Date,Target End Date',
        ...flat.map((r) => toCSVRow(headers, r as unknown as Record<string, unknown>)),
      ];
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="projects-export.csv"',
        },
      });
    }

    if (type === 'invoices') {
      const invoices = await db.invoice.findMany({
        select: {
          invoiceNumber: true,
          status: true,
          totalAmount: true,
          issueDate: true,
          dueDate: true,
          client: { select: { companyName: true } },
        },
        orderBy: { issueDate: 'desc' },
      });

      const flat = invoices.map((inv) => ({
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        totalAmount: inv.totalAmount,
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        clientName: inv.client.companyName,
      }));

      if (format === 'json') {
        return NextResponse.json(flat);
      }

      const headers = ['invoiceNumber', 'status', 'totalAmount', 'issueDate', 'dueDate', 'clientName'];
      const csvRows = [
        'Invoice Number,Status,Total Amount,Issue Date,Due Date,Client',
        ...flat.map((r) => toCSVRow(headers, r as unknown as Record<string, unknown>)),
      ];
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="invoices-export.csv"',
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Error al generar la exportación' },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: 'Tipo no soportado' }, { status: 400 });
}
