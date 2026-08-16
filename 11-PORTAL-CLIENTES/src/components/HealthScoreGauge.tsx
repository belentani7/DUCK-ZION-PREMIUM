// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type GaugeSize = 'sm' | 'md' | 'lg';

interface HealthScoreGaugeProps {
  score: number;
  size?: GaugeSize;
}

const sizeMap: Record<GaugeSize, { outer: number; stroke: number; text: string; label: string }> = {
  sm: { outer: 100, stroke: 8, text: 'text-2xl', label: 'text-[10px]' },
  md: { outer: 140, stroke: 10, text: 'text-3xl', label: 'text-xs' },
  lg: { outer: 180, stroke: 12, text: 'text-4xl', label: 'text-sm' },
};

function getScoreColor(score: number) {
  if (score >= 90) return { stroke: '#059669', text: 'text-emerald-600', label: 'Excelente' };
  if (score >= 70) return { stroke: '#059669', text: 'text-emerald-600', label: 'Bueno' };
  if (score >= 40) return { stroke: '#d97706', text: 'text-amber-600', label: 'Regular' };
  return { stroke: '#dc2626', text: 'text-rose-600', label: 'Crítico' };
}

function getGradientId(score: number) {
  if (score >= 70) return 'gaugeGradGreen';
  if (score >= 40) return 'gaugeGradAmber';
  return 'gaugeGradRed';
}

export function HealthScoreGauge({ score, size = 'md' }: HealthScoreGaugeProps) {
  const config = sizeMap[size];
  const radius = (config.outer - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const colorInfo = getScoreColor(clampedScore);

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, clampedScore, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate(v) {
        setDisplayScore(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [clampedScore]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative inline-flex flex-col items-center"
    >
      <svg
        width={config.outer}
        height={config.outer}
        viewBox={`0 0 ${config.outer} ${config.outer}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id="gaugeGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gaugeGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="gaugeGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={config.stroke}
          strokeLinecap="round"
        />

        {/* Animated progress arc */}
        <motion.circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId(clampedScore)})`}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (clampedScore / 100) * circumference,
          }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>

      {/* Center text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold tabular-nums', config.text, colorInfo.text)}>
          {displayScore}
        </span>
        <span className={cn('font-medium text-slate-500', config.label)}>
          {colorInfo.label}
        </span>
      </div>
    </motion.div>
  );
}
