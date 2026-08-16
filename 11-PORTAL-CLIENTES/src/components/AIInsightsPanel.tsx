// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Lightbulb, Loader2 } from 'lucide-react';
import { usePortalStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ============ TYPES ============
interface AIInsight {
  id: string;
  text: string;
}

interface AIInsightsResponse {
  summary: string;
  insights: string[];
  generatedAt: string;
}

// ============ HELPERS ============
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

// ============ API ============
async function fetchAIInsights(token: string): Promise<AIInsightsResponse | null> {
  const res = await fetch('/api/ai-insights', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// ============ SKELETON ============
function InsightsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
      </div>
      <Separator />
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <Skeleton className="h-3.5 w-full rounded-md" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============ COMPONENT ============
export function AIInsightsPanel() {
  const token = usePortalStore((s) => s.token);
  const [data, setData] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = useCallback(async () => {
    if (!token) return;
    try {
      const result = await fetchAIInsights(token);
      setData(result);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const handleRefresh = async () => {
    if (!token || refreshing) return;
    setRefreshing(true);
    try {
      const result = await fetchAIInsights(token);
      setData(result);
    } catch {
      // Silently fail
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      {/* Gradient border wrapper */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-200 via-emerald-400 to-amber-300 p-[2px] shadow-lg shadow-emerald-500/10">
        <div className="bg-white rounded-[14px] overflow-hidden">
          {/* Premium header */}
          <div className="bg-gradient-to-r from-emerald-600/5 to-amber-500/5 px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 12 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">IA Insights</h3>
                  <p className="text-xs text-slate-500">Análisis inteligente de tu negocio</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Actualizar insights"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </motion.div>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-2">
            {loading ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <InsightsSkeleton />
              </motion.div>
            ) : data ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Summary */}
                <div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {data.summary}
                  </p>
                </div>

                <Separator className="bg-slate-100" />

                {/* Insights list */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Insights clave
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {data.insights.map((insight, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.06 }}
                        className="flex items-start gap-2.5"
                      >
                        <span
                          className={cn(
                            'flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 text-[10px] font-bold',
                            index === 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : index === 1
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm text-slate-600 leading-relaxed">
                          {insight}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Timestamp */}
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400">
                    Generado {timeAgo(data.generatedAt)}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No se pudieron generar insights</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Reintentar
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
