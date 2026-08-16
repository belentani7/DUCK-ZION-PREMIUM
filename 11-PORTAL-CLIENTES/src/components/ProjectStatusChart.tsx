// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface StatusData {
  status: string;
  count: number;
  fill: string;
}

interface ProjectStatusChartProps {
  data: StatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  'Discovery': '#f59e0b',
  'In Progress': '#059669',
  'Review': '#0ea5e9',
  'Completed': '#8b5cf6',
};

function getColor(status: string) {
  return STATUS_COLORS[status] ?? '#94a3b8';
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-slate-100 hover:shadow-xl hover:shadow-black/[0.07] transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Estado de Proyectos</h3>
          <p className="text-xs text-slate-400 mt-0.5">Distribución por estado</p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
          <PieChartIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="count"
              nameKey="status"
              animationDuration={900}
              animationEasing="ease-out"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || getColor(entry.status)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {total}
          </motion.span>
          <span className="text-xs text-slate-400">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((entry, index) => (
          <motion.div
            key={entry.status}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.fill || getColor(entry.status) }}
            />
            <span className="text-xs text-slate-600 truncate">{entry.status}</span>
            <span className="text-xs font-semibold text-slate-900 ml-auto tabular-nums">
              {entry.count}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
