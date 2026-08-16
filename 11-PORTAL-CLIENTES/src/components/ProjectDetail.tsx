// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Building2,
  FolderKanban,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { usePortalStore, type Project, type Deliverable } from '@/lib/store';

interface ProjectDetailProps {
  projectId: string;
  isClient?: boolean;
  onBack?: () => void;
}

function getDeliverableIcon(status: string) {
  switch (status) {
    case 'Approved':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'In Review':
      return <Clock className="h-5 w-5 text-sky-500" />;
    case 'Rejected':
      return <AlertCircle className="h-5 w-5 text-rose-500" />;
    default:
      return <Circle className="h-5 w-5 text-slate-300" />;
  }
}

export function ProjectDetail({ projectId, isClient = false, onBack }: ProjectDetailProps) {
  const { token } = usePortalStore();
  const [project, setProject] = useState<(Project & { deliverables?: Deliverable[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Project status updated to ${newStatus}`);
        fetchProject();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdating(false);
    }
  };

  // Calculate progress
  const deliverables = project?.deliverables ?? [];
  const totalDeliverables = deliverables.length;
  const approvedDeliverables = deliverables.filter((d) => d.status === 'Approved').length;
  const progressPercent = totalDeliverables > 0 ? Math.round((approvedDeliverables / totalDeliverables) * 100) : 0;

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
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FolderKanban className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">Project not found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{project.title}</h1>
            <StatusBadge status={project.status} type="project" />
          </div>
        </div>

        {!isClient && (
          <div className="flex items-center gap-2">
            <Select
              value={project.status}
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger className="w-[150px] border-slate-200 h-9 text-sm">
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Discovery">Discovery</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
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
              {project.client?.companyName ?? 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Start Date</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {project.startDate
                ? format(new Date(project.startDate), 'MMM d, yyyy')
                : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Target End</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {project.targetEndDate
                ? format(new Date(project.targetEndDate), 'MMM d, yyyy')
                : 'Not set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description & Progress */}
      <Card className="rounded-2xl border-slate-100 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {project.description && (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Progress</span>
              <span className="text-emerald-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="relative">
              <Progress
                value={progressPercent}
                className="h-2.5 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              {approvedDeliverables} of {totalDeliverables} deliverables approved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card className="rounded-2xl border-slate-100 shadow-lg shadow-black/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Deliverables
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Track milestones and deliverables for this project
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {totalDeliverables} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {deliverables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No deliverables yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deliverables.map((deliverable, index) => {
                const isOverdue =
                  deliverable.status !== 'Approved' &&
                  deliverable.dueDate &&
                  isPast(parseISO(deliverable.dueDate));

                return (
                  <motion.div
                    key={deliverable.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className={`
                      flex items-start gap-4 p-4 rounded-xl border transition-colors
                      ${
                        deliverable.status === 'Approved'
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : isOverdue
                            ? 'bg-rose-50/50 border-rose-100'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                      }
                    `}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getDeliverableIcon(deliverable.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-800">
                          {deliverable.title}
                        </h4>
                        <StatusBadge status={deliverable.status} type="deliverable" />
                        {isOverdue && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                      {deliverable.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {deliverable.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {deliverable.dueDate
                          ? format(new Date(deliverable.dueDate), 'MMM d, yyyy')
                          : 'No date'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}