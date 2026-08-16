// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ClientCounts {
  projects: number;
  invoices: number;
}

interface ClientRow {
  id: string;
  companyName: string;
  healthScore: number;
  churnRisk: number;
  totalRevenue: number;
  _count?: ClientCounts;
}

interface ClientHealthTableProps {
  clients: ClientRow[];
}

type SortKey = 'companyName' | 'healthScore' | 'churnRisk' | 'totalRevenue' | 'projects' | 'invoices';
type SortDir = 'asc' | 'desc';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function healthColor(score: number) {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-rose-600';
}

function healthBg(score: number) {
  if (score >= 70) return 'bg-emerald-50';
  if (score >= 40) return 'bg-amber-50';
  return 'bg-rose-50';
}

function churnBarColor(risk: number) {
  if (risk <= 0.25) return 'bg-emerald-500';
  if (risk <= 0.5) return 'bg-amber-500';
  return 'bg-rose-500';
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentKey === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn(
        'flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors',
        isActive && 'text-slate-900'
      )}
    >
      {label}
      <ArrowUpDown
        className={cn(
          'w-3 h-3 transition-opacity',
          isActive ? 'opacity-100' : 'opacity-30'
        )}
      />
    </button>
  );
}

export function ClientHealthTable({ clients }: ClientHealthTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('healthScore');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...clients];
    arr.sort((a, b) => {
      let va: string | number;
      let vb: string | number;

      switch (sortKey) {
        case 'companyName':
          va = a.companyName.toLowerCase();
          vb = b.companyName.toLowerCase();
          break;
        case 'healthScore':
          va = a.healthScore;
          vb = b.healthScore;
          break;
        case 'churnRisk':
          va = a.churnRisk;
          vb = b.churnRisk;
          break;
        case 'totalRevenue':
          va = a.totalRevenue;
          vb = b.totalRevenue;
          break;
        case 'projects':
          va = a._count?.projects ?? 0;
          vb = b._count?.projects ?? 0;
          break;
        case 'invoices':
          va = a._count?.invoices ?? 0;
          vb = b._count?.invoices ?? 0;
          break;
        default:
          return 0;
      }

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [clients, sortKey, sortDir]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-slate-100 hover:shadow-xl hover:shadow-black/[0.07] transition-shadow duration-300"
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Salud de Clientes</h3>
          <p className="text-xs text-slate-400 mt-0.5">Métricas de salud y riesgo de abandono</p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="pl-6">
                <SortableHeader label="Empresa" sortKey="companyName" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader label="Salud" sortKey="healthScore" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortableHeader label="Riesgo" sortKey="churnRisk" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <SortableHeader label="Ingresos" sortKey="totalRevenue" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <SortableHeader label="Proyectos" sortKey="projects" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden md:table-cell pr-6">
                <SortableHeader label="Facturas" sortKey="invoices" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((client, index) => (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors cursor-default"
              >
                <TableCell className="pl-6 py-3.5">
                  <span className="text-sm font-medium text-slate-900">{client.companyName}</span>
                </TableCell>
                <TableCell className="py-3.5">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center text-xs font-bold px-2.5 py-1 rounded-full tabular-nums',
                      healthBg(client.healthScore),
                      healthColor(client.healthScore)
                    )}
                  >
                    {client.healthScore}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[48px] max-w-[80px]">
                      <motion.div
                        className={cn('h-full rounded-full', churnBarColor(client.churnRisk))}
                        initial={{ width: 0 }}
                        animate={{ width: `${client.churnRisk * 100}%` }}
                        transition={{ duration: 0.6, delay: index * 0.03 + 0.15, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums w-9 text-right">
                      {Math.round(client.churnRisk * 100)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 hidden sm:table-cell">
                  <span className="text-sm text-slate-700 tabular-nums">
                    {formatCurrency(client.totalRevenue)}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 hidden md:table-cell">
                  <span className="text-sm text-slate-700 tabular-nums">
                    {client._count?.projects ?? 0}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 hidden md:table-cell pr-6">
                  <span className="text-sm text-slate-700 tabular-nums">
                    {client._count?.invoices ?? 0}
                  </span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
