// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Building2, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { usePortalStore, type Invoice, type InvoiceItem } from '@/lib/store';

interface InvoiceDetailProps {
  invoiceId: string;
  isClient?: boolean;
  onBack?: () => void;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export function InvoiceDetail({ invoiceId, isClient = false, onBack }: InvoiceDetailProps) {
  const { token } = usePortalStore();
  const [invoice, setInvoice] = useState<(Invoice & { items?: InvoiceItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
      }
    } catch {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId, token]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Invoice status updated to ${newStatus}`);
        fetchInvoice();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">Invoice not found</p>
      </div>
    );
  }

  const items = invoice.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Back button & header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700 -ml-2 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
            <StatusBadge status={invoice.status} type="invoice" />
          </div>
        </div>

        {!isClient && (
          <div className="flex items-center gap-2">
            <Select
              value={invoice.status}
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger className="w-[140px] border-slate-200 h-9 text-sm">
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Client</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {invoice.client?.companyName ?? 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Issue Date</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Due Date</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Line items table */}
      <Card className="rounded-2xl border-slate-100 shadow-lg shadow-black/5 overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-bold text-slate-900">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  Description
                </TableHead>
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">
                  Qty
                </TableHead>
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">
                  Unit Price
                </TableHead>
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-slate-50">
                  <TableCell className="text-slate-700 font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-slate-600 text-right">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-slate-600 text-right">
                    {formatCurrency(Number(item.unitPrice))}
                  </TableCell>
                  <TableCell className="text-slate-800 font-semibold text-right">
                    {formatCurrency(Number(item.quantity) * Number(item.unitPrice))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4 bg-slate-100" />

          {/* Total */}
          <div className="flex items-center justify-end gap-4">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <motion.span
              key={invoice.totalAmount}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-slate-900"
            >
              {formatCurrency(Number(invoice.totalAmount))}
            </motion.span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold text-slate-900">Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}