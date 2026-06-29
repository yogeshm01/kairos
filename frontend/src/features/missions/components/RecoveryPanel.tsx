import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecoveryPlanResponse } from "@/types/api";

type RecoveryPanelProps = {
  plan?: RecoveryPlanResponse;
  onGenerate: () => void;
  onApply: () => void;
  isGenerating?: boolean;
  isApplying?: boolean;
};

export function RecoveryPanel({
  plan,
  onGenerate,
  onApply,
  isGenerating,
  isApplying,
}: RecoveryPanelProps) {
  return (
    <Card className="border-warning/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-warning" />
          Recovery mode
        </CardTitle>
        <CardDescription>
          When you fall behind, the AI adapts your plan instead of piling on overdue tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!plan ? (
          <Button variant="secondary" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate recovery plan"}
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">{plan.plan.what_changed}</p>
            <p className="text-sm text-muted">{plan.plan.recovery_message}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <RecoveryList title="At risk" items={plan.plan.at_risk_items} />
              <RecoveryList title="Compressed" items={plan.plan.compressed_items} />
            </div>

            <div className="rounded-lg border border-border bg-background/50 p-4">
              <p className="text-sm font-medium">New daily focus</p>
              <p className="mt-1">{plan.plan.new_daily_plan.focus}</p>
              <p className="mt-2 text-sm text-muted">{plan.plan.new_daily_plan.summary}</p>
            </div>

            <Button onClick={onApply} disabled={isApplying}>
              {isApplying ? "Applying..." : "Apply recovery plan"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecoveryList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
