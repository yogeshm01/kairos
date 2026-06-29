import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ConfidenceGaugeProps = {
  score: number;
  trend: string;
  reasons?: string[];
};

export function ConfidenceGauge({ score, trend, reasons = [] }: ConfidenceGaugeProps) {
  const TrendIcon =
    trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Minus;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Mission confidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <span className="text-5xl font-semibold tabular-nums">{score}</span>
          <span className="pb-2 text-muted">/ 100</span>
          <div
            className={cn(
              "mb-2 ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              trend === "improving" && "bg-success/10 text-success",
              trend === "declining" && "bg-danger/10 text-danger",
              trend === "stable" && "bg-surface text-muted",
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {trend}
          </div>
        </div>
        <Progress value={score} />
        {reasons.length ? (
          <ul className="space-y-1 text-sm text-muted">
            {reasons.slice(0, 3).map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
