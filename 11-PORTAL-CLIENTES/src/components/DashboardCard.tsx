// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  index?: number;
}

export function DashboardCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  description,
  index = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className={cn(
        'bg-white rounded-2xl p-6 shadow-lg shadow-black/5',
        'border border-slate-100',
        'hover:shadow-xl hover:shadow-black/[0.07] transition-shadow duration-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">
            {title}
          </p>
          <motion.p
            className="text-3xl font-bold text-slate-900 mt-1 tracking-tight"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.15 }}
          >
            {value}
          </motion.p>
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
            'bg-emerald-50 text-emerald-600'
          )}
        >
          {icon}
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                trendUp
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              )}
            >
              {trendUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-400">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}