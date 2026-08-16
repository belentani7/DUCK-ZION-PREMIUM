// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'project' | 'deliverable' | 'invoice';

interface StatusConfig {
  label: string;
  className: string;
}

const statusMap: Record<StatusType, Record<string, StatusConfig>> = {
  project: {
    'Discovery': {
      label: 'Discovery',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    'In Progress': {
      label: 'In Progress',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    'Review': {
      label: 'Review',
      className: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    'Completed': {
      label: 'Completed',
      className: 'bg-violet-100 text-violet-700 border-violet-200',
    },
  },
  deliverable: {
    'Pending': {
      label: 'Pending',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    'In Review': {
      label: 'In Review',
      className: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    'Approved': {
      label: 'Approved',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    'Rejected': {
      label: 'Rejected',
      className: 'bg-rose-100 text-rose-700 border-rose-200',
    },
  },
  invoice: {
    'Draft': {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    'Sent': {
      label: 'Sent',
      className: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    'Paid': {
      label: 'Paid',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    'Overdue': {
      label: 'Overdue',
      className: 'bg-rose-100 text-rose-700 border-rose-200',
    },
  },
};

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
}

export function StatusBadge({ status, type = 'project' }: StatusBadgeProps) {
  const config = statusMap[type]?.[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Badge
        variant="outline"
        className={cn(
          'font-medium text-xs px-2.5 py-0.5 rounded-full',
          config.className
        )}
      >
        <span className="relative flex h-1.5 w-1.5 mr-1">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              type === 'invoice' && status === 'Overdue'
                ? 'bg-rose-400'
                : type === 'project' && status === 'In Progress'
                  ? 'bg-emerald-400'
                  : type === 'project' && status === 'Discovery'
                    ? 'bg-amber-400'
                    : type === 'deliverable' && status === 'Pending'
                      ? 'bg-amber-400'
                      : type === 'deliverable' && status === 'In Review'
                        ? 'bg-sky-400'
                        : 'bg-slate-300'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-1.5 w-1.5',
              type === 'invoice' && status === 'Overdue'
                ? 'bg-rose-500'
                : type === 'project' && status === 'In Progress'
                  ? 'bg-emerald-500'
                  : type === 'project' && status === 'Discovery'
                    ? 'bg-amber-500'
                    : type === 'deliverable' && status === 'Pending'
                      ? 'bg-amber-500'
                      : type === 'deliverable' && status === 'In Review'
                        ? 'bg-sky-500'
                        : type === 'deliverable' && status === 'Approved'
                          ? 'bg-emerald-500'
                          : type === 'deliverable' && status === 'Rejected'
                            ? 'bg-rose-500'
                            : type === 'invoice' && status === 'Paid'
                              ? 'bg-emerald-500'
                              : type === 'invoice' && status === 'Sent'
                                ? 'bg-sky-500'
                                : 'bg-slate-400'
            )}
          />
        </span>
        {config.label}
      </Badge>
    </motion.span>
  );
}