// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // Fetch real data from Prisma to provide context to AI
  const [clientStats, projectStats, invoiceStats, deliverableStats, overdueInvoices, recentProjects] =
    await Promise.all([
      db.client.findMany({
        select: { companyName: true, healthScore: true, churnRisk: true, totalRevenue: true, industry: true, city: true },
        orderBy: { healthScore: 'asc' },
        take: 10,
      }),
      db.project.groupBy({ by: ['status'], _count: true }),
      db.invoice.groupBy({ by: ['status'], _count: true, _sum: { totalAmount: true } }),
      db.deliverable.groupBy({ by: ['status'], _count: true }),
      db.invoice.findMany({
        where: { status: 'Overdue' },
        include: { client: { select: { companyName: true } } },
        take: 10,
      }),
      db.project.findMany({
        where: { status: { in: ['In Progress', 'Discovery'] } },
        include: { client: { select: { companyName: true } } },
        orderBy: { progress: 'desc' },
        take: 10,
      }),
    ]);

  const totalRevenue = await db.invoice.aggregate({
    where: { status: 'Paid' },
    _sum: { totalAmount: true },
  });

  const totalClients = await db.client.count();
  const avgHealth = await db.client.aggregate({ _avg: { healthScore: true } });

  // Build a context string for the LLM
  const context = `
DATOS DEL PORTAL DE CLIENTES (resumen ejecutivo):

--- Clientes ---
- Total de clientes: ${totalClients}
- Salud media: ${Math.round(avgHealth._avg.healthScore || 0)}/100
- Ingresos totales (facturas pagadas): €${Math.round(totalRevenue._sum.totalAmount || 0).toLocaleString('es-ES')}
- Clientes con menor salud:
${clientStats.slice(0, 5).map(c => `  • ${c.companyName} (${c.industry || 'N/A'}, ${c.city || 'N/A'}): salud=${c.healthScore}, riesgo abandono=${(c.churnRisk * 100).toFixed(1)}%, ingresos=€${Math.round(c.totalRevenue).toLocaleString('es-ES')}`).join('\n')}

--- Proyectos ---
${projectStats.map(p => `- ${p.status}: ${p._count} proyectos`).join('\n')}
- Proyectos recientes activos:
${recentProjects.map(p => `  • ${p.title} (${p.client.companyName}): ${p.progress}%`).join('\n')}

--- Facturas ---
${invoiceStats.map(i => `- ${i.status}: ${i._count} facturas, total €${Math.round(i._sum.totalAmount || 0).toLocaleString('es-ES')}`).join('\n')}
- Facturas vencidas recientes:
${overdueInvoices.map(i => `  • ${i.client.companyName}: €${i.totalAmount.toLocaleString('es-ES')}`).join('\n') || '  • Ninguna'}

--- Entregables ---
${deliverableStats.map(d => `- ${d.status}: ${d._count}`).join('\n')}
`;

  const prompt = `Eres un analista de negocio experto que trabaja en una agencia de desarrollo de software. Basándote EXCLUSIVAMENTE en los siguientes datos del portal de clientes, genera un informe ejecutivo conciso y accionable en español.

IMPORTANTE: Responde SOLO en español. Usa formato markdown con encabezados y listas.

${context}

Tu informe debe incluir estas secciones:

## Resumen Ejecutivo
Un párrafo de 3-4 líneas con el panorama general.

## Salud de Clientes
Análisis de los clientes con menor salud y recomendaciones.

## Tendencias de Ingresos
Comentario sobre la facturación y facturas pendientes/vencidas.

## Estado de Proyectos
Resumen del progreso y posibles riesgos.

## Alertas de Riesgo
Lista de 3-5 alertas concretas y accionables.

## Recomendaciones
5 recomendaciones estratégicas específicas basadas en los datos.

Genera el informe ahora:`;

  try {
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Eres un analista de negocio senior. Generas informes ejecutivos claros, concisos y basados en datos. Responde siempre en español con formato markdown.' },
        { role: 'user', content: prompt },
      ],
    });

    const insights = response?.choices?.[0]?.message?.content || JSON.stringify(response);

    return NextResponse.json({
      insights,
      summary: `Informe generado con datos de ${totalClients} clientes, ${projectStats.reduce((s, p) => s + p._count, 0)} proyectos y €${Math.round(totalRevenue._sum.totalAmount || 0).toLocaleString('es-ES')} en ingresos.`,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Insights error:', error);
    return NextResponse.json({
      insights: 'No se pudo generar el informe de IA en este momento. Por favor, inténtelo de nuevo más tarde.',
      summary: 'Error al generar insights con IA.',
      generatedAt: new Date().toISOString(),
    }, { status: 500 });
  }
}
