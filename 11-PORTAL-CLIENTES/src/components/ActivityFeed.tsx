// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, CheckCircle, Send, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityUser {
  fullName: string;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  user?: ActivityUser;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  create: { icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  update: { icon: Pencil, color: 'text-amber-600', bg: 'bg-amber-100' },
  delete: { icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-100' },
  complete: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  send: { icon: Send, color: 'text-sky-600', bg: 'bg-sky-100' },
};

function getActionConfig(action: string) {
  const key = action.toLowerCase() as keyof typeof actionConfig;
  return actionConfig[key] ?? { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-100' };
}

function relativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-slate-100 hover:shadow-xl hover:shadow-black/[0.07] transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Actividad Reciente</h3>
          <p className="text-xs text-slate-400 mt-0.5">Últimas acciones del equipo</p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <ScrollArea className="max-h-96">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-100" />

          <div className="space-y-1">
            {activities.map((activity, index) => {
              const cfg = getActionConfig(activity.action);
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.06,
                    ease: 'easeOut',
                  }}
                  className="relative flex gap-3 py-2.5 group"
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0',
                      'ring-4 ring-white',
                      cfg.bg
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-slate-700 leading-snug">
                      {activity.user && (
                        <span className="font-semibold text-slate-900">
                          {activity.user.fullName}
                        </span>
                      )}
                      {activity.user ? ' ' : ''}
                      <span>{activity.description}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {relativeTime(activity.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
