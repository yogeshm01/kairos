import { CheckCircle2, Circle, SkipForward } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { priorityLabel } from "@/lib/utils";
import type { DashboardTask, TaskStatus } from "@/types/api";

type TodayPlanProps = {
  focus: string;
  summary?: string | null;
  tasks: DashboardTask[];
  estimatedMinutes: number;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isUpdating?: boolean;
};

export function TodayPlan({
  focus,
  summary,
  tasks,
  estimatedMinutes,
  onStatusChange,
  isUpdating,
}: TodayPlanProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s plan</CardTitle>
        <CardDescription>
          {focus} · ~{estimatedMinutes} min total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? <p className="text-sm text-muted">{summary}</p> : null}

        {!tasks.length ? (
          <p className="text-sm text-muted">No tasks scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map(({ task, why_it_matters }) => (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-background/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={task.status} />
                      <p className="font-medium">{task.title}</p>
                      <Badge variant="outline">{priorityLabel(task.priority)}</Badge>
                    </div>
                    {why_it_matters ? (
                      <p className="text-sm text-muted">{why_it_matters}</p>
                    ) : null}
                    {task.estimated_minutes ? (
                      <p className="text-xs text-muted">{task.estimated_minutes} min</p>
                    ) : null}
                  </div>

                  {task.status !== "completed" && task.status !== "skipped" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onStatusChange(task.id, "completed")}
                      >
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isUpdating}
                        onClick={() => onStatusChange(task.id, "skipped")}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "skipped") return <SkipForward className="h-4 w-4 text-muted" />;
  return <Circle className="h-4 w-4 text-accent" />;
}
