// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { usePortalStore } from '@/lib/store';

// ---------- Schema ----------
const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be > 0'),
  unitPrice: z.number().min(0, 'Price must be >= 0'),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CreateInvoiceFormProps {
  onSuccess?: () => void;
}

export function CreateInvoiceForm({ onSuccess }: CreateInvoiceFormProps) {
  const { token } = usePortalStore();
  const [clients, setClients] = useState<{ id: string; companyName: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Draft',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setClients(
            Array.isArray(data)
              ? data.map((c: { id: string; companyName: string }) => ({
                  id: c.id,
                  companyName: c.companyName,
                }))
              : []
          );
        }
      } catch {
        // silently fail
      }
    }
    fetchClients();
  }, [token]);

  const items = watch('items');

  const total = (items ?? []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const onSubmit = useCallback(
    async (data: InvoiceFormData) => {
      setSubmitting(true);
      try {
        const payload = {
          ...data,
          totalAmount: total,
          items: data.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        };

        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          toast.success('Invoice created successfully!');
          reset();
          onSuccess?.();
        } else {
          const err = await res.json().catch(() => ({ error: 'Failed to create invoice' }));
          toast.error(err.error || 'Failed to create invoice');
        }
      } catch {
        toast.error('Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [total, token, reset, onSuccess]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="rounded-2xl shadow-lg shadow-black/5 border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-slate-900">
            Create New Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Client & Invoice Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-slate-700 font-medium">
                  Client <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={watch('clientId')}
                  onValueChange={(val) => setValue('clientId', val, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full border-slate-200">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-xs text-rose-500">{errors.clientId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-slate-700 font-medium">
                  Invoice Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  placeholder="INV-001"
                  className="border-slate-200"
                  {...register('invoiceNumber')}
                />
                {errors.invoiceNumber && (
                  <p className="text-xs text-rose-500">{errors.invoiceNumber.message}</p>
                )}
              </div>
            </div>

            {/* Dates & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-slate-700 font-medium">
                  Issue Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="issueDate"
                  type="date"
                  className="border-slate-200"
                  {...register('issueDate')}
                />
                {errors.issueDate && (
                  <p className="text-xs text-rose-500">{errors.issueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-slate-700 font-medium">
                  Due Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  className="border-slate-200"
                  {...register('dueDate')}
                />
                {errors.dueDate && (
                  <p className="text-xs text-rose-500">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-700 font-medium">
                  Status
                </Label>
                <Select
                  value={watch('status')}
                  onValueChange={(val) =>
                    setValue('status', val as InvoiceFormData['status'], { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                  Line Items
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {/* Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-3 text-xs font-medium text-slate-400 uppercase tracking-wider px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-3">Unit Price</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1" />
                </div>

                {fields.map((field, index) => {
                  const qty = Number(items?.[index]?.quantity) || 0;
                  const price = Number(items?.[index]?.unitPrice) || 0;
                  const amount = qty * price;

                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-slate-50/80 rounded-xl p-3 border border-slate-100"
                    >
                      <div className="md:col-span-5 space-y-1">
                        <Label className="md:hidden text-xs text-slate-500">Description</Label>
                        <Input
                          placeholder="Service description"
                          className="border-slate-200 bg-white text-sm"
                          {...register(`items.${index}.description`)}
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-xs text-rose-500">
                            {errors.items[index].description?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <Label className="md:hidden text-xs text-slate-500">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="border-slate-200 bg-white text-sm"
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="text-xs text-rose-500">
                            {errors.items[index].quantity?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <Label className="md:hidden text-xs text-slate-500">Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="border-slate-200 bg-white text-sm"
                          {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        />
                        {errors.items?.[index]?.unitPrice && (
                          <p className="text-xs text-rose-500">
                            {errors.items[index].unitPrice?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-1 flex items-center h-9">
                        <span className="text-sm font-medium text-slate-700">
                          {formatCurrency(amount)}
                        </span>
                      </div>

                      <div className="md:col-span-1 flex items-start justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {errors.items?.root && (
                <p className="text-xs text-rose-500">{errors.items.root.message}</p>
              )}
            </div>

            <Separator className="bg-slate-100" />

            {/* Total */}
            <div className="flex items-center justify-end gap-4">
              <span className="text-sm font-medium text-slate-500">Total</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or payment terms..."
                className="border-slate-200 min-h-[80px] resize-none"
                {...register('notes')}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-11 rounded-xl font-medium shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Invoice'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
