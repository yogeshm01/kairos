import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Milestone } from "@/types/api";

type MilestoneTimelineProps = {
  milestones: Milestone[];
};

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {!milestones.length ? (
          <p className="text-sm text-muted">No milestones yet.</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-xs font-medium">
                    {index + 1}
                  </div>
                  {index < milestones.length - 1 ? (
                    <div className="mt-1 h-full w-px bg-border" />
                  ) : null}
                </div>
                <div className="pb-4">
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-sm text-muted">
                    Due {formatDate(milestone.due_date)} · {milestone.status}
                  </p>
                  {milestone.description ? (
                    <p className="mt-1 text-sm text-muted">{milestone.description}</p>
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
