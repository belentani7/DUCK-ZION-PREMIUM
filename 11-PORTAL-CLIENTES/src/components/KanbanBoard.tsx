// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalStore, type Project } from '@/lib/store';
import {
  GripVertical,
  Loader2,
  Inbox,
  CircleDot,
  Eye,
  CheckCircle2,
  Building2,
  ClipboardList,
} from 'lucide-react';

// ============ TYPES ============

interface KanbanBoardProps {
  projects: Project[];
  onUpdateProject?: (id: string, status: string) => void;
}

type KanbanStatus = Project['status'];

interface ColumnDef {
  id: KanbanStatus;
  title: string;
  icon: React.ReactNode;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  columnBg: string;
  columnBorder: string;
  badgeBg: string;
  badgeText: string;
  progressIndicator: string;
}

// ============ COLUMN CONFIGURATION ============

const COLUMNS: ColumnDef[] = [
  {
    id: 'Discovery',
    title: 'Discovery',
    icon: <CircleDot className="h-4 w-4" />,
    headerBg: 'bg-amber-500/10 dark:bg-amber-400/10',
    headerBorder: 'border-amber-200 dark:border-amber-800/50',
    headerText: 'text-amber-700 dark:text-amber-400',
    columnBg: 'bg-amber-50/50 dark:bg-amber-950/20',
    columnBorder: 'border-amber-200/60 dark:border-amber-800/30',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    badgeText: 'text-amber-600 dark:text-amber-400',
    progressIndicator: 'bg-amber-500',
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    icon: <ClipboardList className="h-4 w-4" />,
    headerBg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    headerBorder: 'border-emerald-200 dark:border-emerald-800/50',
    headerText: 'text-emerald-700 dark:text-emerald-400',
    columnBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    columnBorder: 'border-emerald-200/60 dark:border-emerald-800/30',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    progressIndicator: 'bg-emerald-500',
  },
  {
    id: 'Review',
    title: 'Review',
    icon: <Eye className="h-4 w-4" />,
    headerBg: 'bg-sky-500/10 dark:bg-sky-400/10',
    headerBorder: 'border-sky-200 dark:border-sky-800/50',
    headerText: 'text-sky-700 dark:text-sky-400',
    columnBg: 'bg-sky-50/50 dark:bg-sky-950/20',
    columnBorder: 'border-sky-200/60 dark:border-sky-800/30',
    badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    badgeText: 'text-sky-600 dark:text-sky-400',
    progressIndicator: 'bg-sky-500',
  },
  {
    id: 'Completed',
    title: 'Completed',
    icon: <CheckCircle2 className="h-4 w-4" />,
    headerBg: 'bg-violet-500/10 dark:bg-violet-400/10',
    headerBorder: 'border-violet-200 dark:border-violet-800/50',
    headerText: 'text-violet-700 dark:text-violet-400',
    columnBg: 'bg-violet-50/50 dark:bg-violet-950/20',
    columnBorder: 'border-violet-200/60 dark:border-violet-800/30',
    badgeBg: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    badgeText: 'text-violet-600 dark:text-violet-400',
    progressIndicator: 'bg-violet-500',
  },
];

// ============ HELPERS ============

function getProjectProgress(project: Project): number {
  if (!project.deliverables || project.deliverables.length === 0) return 0;
  const approved = project.deliverables.filter(
    (d) => d.status === 'Approved'
  ).length;
  return Math.round((approved / project.deliverables.length) * 100);
}

function getColumnDef(id: KanbanStatus): ColumnDef {
  return COLUMNS.find((c) => c.id === id)!;
}

// ============ SORTABLE CARD ============

interface SortableCardProps {
  project: Project;
  isUpdating: boolean;
}

function SortableCard({ project, isUpdating }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const col = getColumnDef(project.status);
  const progress = getProjectProgress(project);
  const deliverablesCount = project.deliverables?.length ?? 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <div
          className={`
            group relative rounded-xl border bg-card text-card-foreground
            shadow-sm hover:shadow-lg transition-all duration-300 ease-out
            hover:border-foreground/15 dark:hover:border-foreground/20
            ${isDragging ? 'ring-2 ring-primary/40 shadow-xl' : ''}
          `}
        >
          {/* Drag Handle + Header */}
          <div className="flex items-start justify-between p-3 pb-0">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <button
                className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                {...listeners}
                aria-label="Drag project card"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <h3 className="font-semibold text-sm leading-tight truncate">
                {project.title}
              </h3>
            </div>
            {isUpdating && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
            )}
          </div>

          {/* Card Body */}
          <div className="px-3 pt-2 pb-3 space-y-2.5">
            {/* Client */}
            {project.client && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{project.client.companyName}</span>
              </div>
            )}

            {/* Progress */}
            {deliverablesCount > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progress}% complete
                  </span>
                  <span className="text-muted-foreground">
                    {project.deliverables!.filter((d) => d.status === 'Approved')
                      .length}{' '}
                    / {deliverablesCount}
                  </span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${col.progressIndicator}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Deliverables Badge */}
            {deliverablesCount > 0 && (
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 h-5 ${col.badgeBg}`}
              >
                {deliverablesCount} deliverable{deliverablesCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Bottom Accent Line */}
          <div
            className={`h-0.5 rounded-b-xl ${col.progressIndicator} opacity-30 group-hover:opacity-60 transition-opacity duration-300`}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ============ DRAG OVERLAY CARD ============

interface DragOverlayCardProps {
  project: Project;
}

function DragOverlayCard({ project }: DragOverlayCardProps) {
  const col = getColumnDef(project.status);
  const progress = getProjectProgress(project);
  const deliverablesCount = project.deliverables?.length ?? 0;

  return (
    <div
      className={`
        rounded-xl border bg-card text-card-foreground
        shadow-2xl ring-2 ring-primary/30 w-full rotate-2 scale-105
        transition-transform duration-150
      `}
      style={{ transform: 'rotate(2deg) scale(1.03)' }}
    >
      <div className="flex items-start justify-between p-3 pb-0">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <GripVertical className="h-4 w-4 text-primary/50 shrink-0 mt-0.5" />
          <h3 className="font-semibold text-sm leading-tight truncate">
            {project.title}
          </h3>
        </div>
      </div>
      <div className="px-3 pt-2 pb-3 space-y-2.5">
        {project.client && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{project.client.companyName}</span>
          </div>
        )}
        {deliverablesCount > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{progress}%</span>
              <span className="text-muted-foreground">
                {project.deliverables!.filter((d) => d.status === 'Approved')
                  .length}{' '}
                / {deliverablesCount}
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
              <div
                className={`h-full rounded-full ${col.progressIndicator}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div className={`h-0.5 rounded-b-xl ${col.progressIndicator} opacity-50`} />
    </div>
  );
}

// ============ EMPTY STATE ============

interface EmptyStateProps {
  column: ColumnDef;
}

function EmptyState({ column }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`
        flex flex-col items-center justify-center py-10 px-4
        rounded-lg border border-dashed
        ${column.columnBorder}
        text-center
      `}
    >
      <div
        className={`
          rounded-full p-3 mb-3
          ${column.headerBg}
        `}
      >
        <Inbox className={`h-5 w-5 ${column.headerText}`} />
      </div>
      <p className="text-xs text-muted-foreground font-medium">
        No projects
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
        Drag projects here
      </p>
    </motion.div>
  );
}

// ============ KANBAN COLUMN ============

interface KanbanColumnProps {
  column: ColumnDef;
  projectIds: UniqueIdentifier[];
  projects: Project[];
  isUpdatingId: string | null;
}

function KanbanColumn({
  column,
  projectIds,
  projects,
  isUpdatingId,
}: KanbanColumnProps) {
  return (
    <div
      className={`
        flex flex-col rounded-xl border
        ${column.columnBorder}
        ${column.columnBg}
        overflow-hidden transition-colors duration-200
        min-h-[200px]
      `}
    >
      {/* Column Header */}
      <div
        className={`
          flex items-center justify-between px-4 py-3 border-b
          ${column.headerBorder}
          ${column.headerBg}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={column.headerText}>{column.icon}</span>
          <h2
            className={`
              font-semibold text-sm tracking-tight
              ${column.headerText}
            `}
          >
            {column.title}
          </h2>
        </div>
        <Badge
          variant="secondary"
          className={`text-[10px] h-5 min-w-[20px] justify-center ${column.badgeBg}`}
        >
          {projectIds.length}
        </Badge>
      </div>

      {/* Cards Area */}
      <div className="p-3 space-y-3 flex-1">
        <AnimatePresence mode="popLayout">
          {projectIds.length === 0 ? (
            <EmptyState key="empty" column={column} />
          ) : (
            <SortableContext
              items={projectIds}
              strategy={verticalListSortingStrategy}
            >
              {projectIds.map((id) => {
                const project = projects.find((p) => p.id === id);
                if (!project) return null;
                return (
                  <SortableCard
                    key={project.id}
                    project={project}
                    isUpdating={isUpdatingId === project.id}
                  />
                );
              })}
            </SortableContext>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============ MAIN KANBAN BOARD ============

export function KanbanBoard({ projects, onUpdateProject }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Organize projects into columns by status
  const columnsData = useMemo(() => {
    const map = new Map<KanbanStatus, Project[]>();
    for (const col of COLUMNS) {
      map.set(col.id, []);
    }
    for (const project of projects) {
      const list = map.get(project.status);
      if (list) {
        list.push(project);
      }
    }
    return map;
  }, [projects]);

  // Sensors for drag-and-drop activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  // Find which column a project belongs to
  const findColumnOfProject = useCallback(
    (id: UniqueIdentifier): KanbanStatus | undefined => {
      for (const col of COLUMNS) {
        if (columnsData.get(col.id)?.some((p) => p.id === id)) {
          return col.id;
        }
      }
      return undefined;
    },
    [columnsData]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeStatus = findColumnOfProject(active.id);
      const overProject = projects.find((p) => p.id === over.id);

      if (!activeStatus) return;

      // Determine the target column
      let targetColumn: KanbanStatus;
      if (COLUMNS.some((c) => c.id === (over.id as string))) {
        // Dropped directly on a column
        targetColumn = over.id as KanbanStatus;
      } else if (overProject) {
        targetColumn = overProject.status;
      } else {
        return;
      }

      // If moving to a different column, update the local state optimistically
      if (activeStatus !== targetColumn) {
        const sourceList = columnsData.get(activeStatus);
        const destList = columnsData.get(targetColumn);
        if (!sourceList || !destList) return;

        const activeProjectIndex = sourceList.findIndex(
          (p) => p.id === active.id
        );
        if (activeProjectIndex === -1) return;

        const [movedProject] = sourceList.splice(activeProjectIndex, 1);
        destList.push(movedProject);
      }
    },
    [projects, columnsData, findColumnOfProject]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeProject = projects.find((p) => p.id === active.id);
      if (!activeProject) return;

      // Determine target column
      let targetStatus: KanbanStatus;
      if (COLUMNS.some((c) => c.id === (over.id as string))) {
        targetStatus = over.id as KanbanStatus;
      } else {
        const overProject = projects.find((p) => p.id === over.id);
        if (overProject) {
          targetStatus = overProject.status;
        } else {
          return;
        }
      }

      // If status changed, call API
      if (activeProject.status !== targetStatus) {
        setUpdatingId(activeProject.id);
        try {
          const token = usePortalStore.getState().token;
          const res = await fetch('/api/projects/' + activeProject.id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: 'Bearer ' + token } : {}),
            },
            body: JSON.stringify({ status: targetStatus }),
          });

          if (res.ok && onUpdateProject) {
            onUpdateProject(activeProject.id, targetStatus);
          }
        } catch {
          // Silently fail – the optimistic update from dragOver already moved the card
        } finally {
          setUpdatingId(null);
        }
      }
    },
    [projects, onUpdateProject]
  );

  const activeProject = activeId
    ? projects.find((p) => p.id === activeId)
    : null;

  return (
    <div className="w-full h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Column Droppable Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              projectIds={
                columnsData.get(col.id)?.map((p) => p.id) ?? []
              }
              projects={projects}
              isUpdatingId={updatingId}
            />
          ))}
        </div>

        {/* Drag Overlay — renders the floating card while dragging */}
        <DragOverlay dropAnimation={null}>
          {activeProject ? (
            <div className="w-[280px]">
              <DragOverlayCard project={activeProject} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
