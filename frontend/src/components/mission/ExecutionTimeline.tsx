import { motion } from "framer-motion";
import { CheckCircle2, Circle, Flag } from "lucide-react";

import { GlowPanel } from "@/components/ui/glow-panel";
import { formatDate } from "@/lib/utils";
import type { Milestone } from "@/types/api";
import type { DashboardTask } from "@/types/api";

type ExecutionTimelineProps = {
  milestones: Milestone[];
  tasks: DashboardTask[];
};

export function ExecutionTimeline({ milestones, tasks }: ExecutionTimelineProps) {
  const completedTasks = tasks.filter((t) => t.task.status === "completed").length;

  return (
    <GlowPanel className="p-6 md:p-8">
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        Execution Timeline
      </h3>

      <div className="mt-8 space-y-6">
        <TimelineNode
          label="Mission"
          status="active"
          detail={`${completedTasks} tasks in motion`}
        />

        {milestones.map((m, i) => (
          <TimelineNode
            key={m.id}
            label={m.title}
            status={m.status === "completed" ? "done" : i === 0 ? "active" : "upcoming"}
            detail={m.due_date ? `Due ${formatDate(m.due_date)}` : undefined}
            indent
          />
        ))}

        {tasks.slice(0, 4).map((t) => (
          <TimelineNode
            key={t.task.id}
            label={t.task.title}
            status={t.task.status === "completed" ? "done" : "upcoming"}
            detail={t.task.estimated_minutes ? `${t.task.estimated_minutes}m` : undefined}
            indent
            small
          />
        ))}
      </div>
    </GlowPanel>
  );
}

function TimelineNode({
  label,
  status,
  detail,
  indent,
  small,
}: {
  label: string;
  status: "done" | "active" | "upcoming";
  detail?: string;
  indent?: boolean;
  small?: boolean;
}) {
  const Icon = status === "done" ? CheckCircle2 : status === "active" ? Flag : Circle;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-start gap-3 ${indent ? "ml-6" : ""}`}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          status === "done"
            ? "text-success"
            : status === "active"
              ? "text-accent"
              : "text-muted"
        }`}
      />
      <div>
        <p className={`${small ? "text-sm" : "font-medium"} ${status === "upcoming" ? "text-muted" : ""}`}>
          {label}
        </p>
        {detail ? <p className="text-xs text-muted">{detail}</p> : null}
      </div>
    </motion.div>
  );
}
