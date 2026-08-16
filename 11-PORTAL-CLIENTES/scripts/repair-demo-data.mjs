import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const invoices = await prisma.invoice.findMany({
  where: { items: { some: { unitPrice: { lte: 0 } } } },
  include: { items: { orderBy: { id: "asc" } } },
});

for (const invoice of invoices) {
  const weights = invoice.items.map((item) => Math.max(1, Math.abs(item.unitPrice * item.quantity)));
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  let allocated = 0;
  for (let index = 0; index < invoice.items.length; index += 1) {
    const item = invoice.items[index];
    const last = index === invoice.items.length - 1;
    const lineTotal = last ? invoice.totalAmount - allocated : invoice.totalAmount * (weights[index] / weightTotal);
    const unitPrice = Math.max(0.01, Math.round((lineTotal / item.quantity) * 100) / 100);
    await prisma.invoiceItem.update({ where: { id: item.id }, data: { unitPrice } });
    allocated += unitPrice * item.quantity;
  }
  const repaired = await prisma.invoiceItem.findMany({ where: { invoiceId: invoice.id } });
  const repairedTotal = repaired.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  await prisma.invoice.update({ where: { id: invoice.id }, data: { totalAmount: Math.round(repairedTotal * 100) / 100 } });
}

console.log(JSON.stringify({ repairedInvoices: invoices.length }));
await prisma.$disconnect();
