import { motion } from "framer-motion";

import { GlowPanel } from "@/components/ui/glow-panel";
import type { Milestone } from "@/types/api";
import type { DashboardTask } from "@/types/api";

type ExecutionGraphProps = {
  missionTitle: string;
  milestones: Milestone[];
  tasks: DashboardTask[];
};

export function ExecutionGraph({ missionTitle, milestones, tasks }: ExecutionGraphProps) {
  return (
    <GlowPanel className="overflow-hidden p-6 md:p-8">
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        Dependency Graph
      </h3>

      <div className="mt-8 flex flex-col items-center">
        <GraphNode label={missionTitle} level="mission" />

        <Connector />

        <div className="flex flex-wrap justify-center gap-4">
          {milestones.slice(0, 4).map((m) => (
            <GraphNode key={m.id} label={m.title} level="milestone" />
          ))}
        </div>

        {tasks.length > 0 ? (
          <>
            <Connector />
            <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {tasks.slice(0, 4).map((t) => (
                <GraphNode
                  key={t.task.id}
                  label={t.task.title}
                  level="task"
                  status={t.task.status}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </GlowPanel>
  );
}

function GraphNode({
  label,
  level,
  status,
}: {
  label: string;
  level: "mission" | "milestone" | "task";
  status?: string;
}) {
  const styles = {
    mission: "border-accent/40 bg-accent/10 text-foreground px-6 py-3 text-base font-semibold",
    milestone: "border-border bg-surface-elevated px-4 py-2 text-sm font-medium",
    task: "border-border/60 bg-background/80 px-3 py-2 text-xs",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`max-w-[200px] truncate rounded-xl border text-center ${styles[level]} ${
        status === "completed" ? "opacity-60 line-through" : ""
      }`}
      title={label}
    >
      {label}
    </motion.div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="h-6 w-px bg-gradient-to-b from-accent/50 to-border" />
      <div className="h-0 w-0 border-x-4 border-t-8 border-x-transparent border-t-border" />
    </div>
  );
}
