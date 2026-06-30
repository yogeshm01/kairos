import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock3,
  Edit2,
  MoreHorizontal,
  PlayCircle,
  SkipForward,
  Calendar,
  MinusCircle,
} from "lucide-react";

import { GlowPanel } from "@/components/ui/glow-panel";
import { formatDate } from "@/lib/utils";
import type { Milestone } from "@/types/api";
import type { DashboardTask, Task } from "@/types/api";

type ExecutionTimelineProps = {
  milestones: Milestone[];
  tasks: DashboardTask[];
  onTaskComplete?: (taskId: string) => void;
  onTaskStart?: (taskId: string) => void;
  onTaskSkip?: (taskId: string) => void;
  onTaskReschedule?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
};

type TaskStatusState = "completed" | "current" | "upcoming" | "skipped";

function getTaskStatusState(task: Task): TaskStatusState {
  if (task.status === "completed") return "completed";
  if (task.status === "skipped") return "skipped";
  if (task.status === "in_progress") return "current";
  return "upcoming";
}

export function ExecutionTimeline({
  milestones,
  tasks,
  onTaskComplete,
  onTaskStart,
  onTaskSkip,
  onTaskReschedule,
  onTaskEdit,
}: ExecutionTimelineProps) {
  const completedTasks = tasks.filter((t) => t.task.status === "completed").length;
  const milestoneGroups = milestones.map((milestone) => ({
    milestone,
    tasks: tasks.filter((item) => item.task.milestone_id === milestone.id),
  }));
  const unassignedTasks = tasks.filter((item) => !item.task.milestone_id);

  return (
    <GlowPanel className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            Execution Timeline
          </h3>
          <p className="mt-2 text-sm text-muted">
            {completedTasks} completed · {tasks.length} scheduled today
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/10 p-2 text-accent">
              <PlayCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Mission focus</p>
              <p className="text-sm text-muted">{completedTasks} tasks already completed</p>
            </div>
          </div>
        </div>

        {milestoneGroups.map(({ milestone, tasks: milestoneTasks }) => (
          <div key={milestone.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{milestone.title}</p>
                {milestone.due_date ? (
                  <p className="mt-1 text-sm text-muted">Due {formatDate(milestone.due_date)}</p>
                ) : null}
              </div>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                {milestoneTasks.length} task{milestoneTasks.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {milestoneTasks.length === 0 ? (
                <p className="text-sm text-muted">No tasks scheduled for this milestone yet.</p>
              ) : (
                milestoneTasks.map((item) => (
                  <TaskRow
                    key={item.task.id}
                    task={item.task}
                    detail={item.why_it_matters}
                    onTaskComplete={onTaskComplete}
                    onTaskStart={onTaskStart}
                    onTaskSkip={onTaskSkip}
                    onTaskReschedule={onTaskReschedule}
                    onTaskEdit={onTaskEdit}
                  />
                ))
              )}
            </div>
          </div>
        ))}

        {unassignedTasks.length > 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Unassigned tasks</p>
              <span className="rounded-full border border-muted/20 bg-muted/10 px-2.5 py-1 text-xs text-muted">
                {unassignedTasks.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {unassignedTasks.map((item) => (
                <TaskRow
                  key={item.task.id}
                  task={item.task}
                  detail={item.why_it_matters}
                  onTaskComplete={onTaskComplete}
                  onTaskStart={onTaskStart}
                  onTaskSkip={onTaskSkip}
                  onTaskReschedule={onTaskReschedule}
                  onTaskEdit={onTaskEdit}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </GlowPanel>
  );
}

function TaskRow({
  task,
  detail,
  onTaskComplete,
  onTaskStart,
  onTaskSkip,
  onTaskReschedule,
  onTaskEdit,
}: {
  task: Task;
  detail?: string | null;
  onTaskComplete?: (taskId: string) => void;
  onTaskStart?: (taskId: string) => void;
  onTaskSkip?: (taskId: string) => void;
  onTaskReschedule?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const statusState = getTaskStatusState(task);
  const isCompleted = statusState === "completed";

  const StatusIcon = {
    completed: CheckCircle2,
    current: PlayCircle,
    upcoming: Clock3,
    skipped: MinusCircle,
  }[statusState];

  const statusClasses = {
    completed: "border-success/20 bg-success/10 text-success",
    current: "border-accent/20 bg-accent/10 text-accent",
    upcoming: "border-muted/20 bg-muted/10 text-muted",
    skipped: "border-danger/20 bg-danger/10 text-danger",
  }[statusState];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-background/70 p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`rounded-full border p-1.5 ${statusClasses}`}>
            <StatusIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium ${isCompleted ? "text-muted line-through" : "text-foreground"}`}>
              {task.title}
            </p>
            <p className="mt-1 text-xs text-muted">
              {task.estimated_minutes ? `${task.estimated_minutes} min` : "Flexible"}
              {detail ? ` · ${detail}` : ""}
            </p>
          </div>
        </div>
        <div className="relative flex shrink-0 items-center gap-2">
          {!isCompleted && onTaskComplete ? (
            <button
              onClick={() => onTaskComplete(task.id)}
              className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Complete
            </button>
          ) : null}
          <button
            onClick={() => setShowMenu((value) => !value)}
            className="rounded-full p-1.5 text-muted transition hover:bg-accent/10 hover:text-foreground"
            aria-label="Task actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu ? (
            <div className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-border/60 bg-background/95 p-1 shadow-xl">
              {onTaskEdit ? (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onTaskEdit(task.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent/10"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
              ) : null}
              {onTaskReschedule ? (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onTaskReschedule(task.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent/10"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Reschedule
                </button>
              ) : null}
              {onTaskSkip ? (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onTaskSkip(task.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
