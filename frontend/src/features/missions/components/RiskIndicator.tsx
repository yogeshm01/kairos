import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { riskBg, riskColor } from "@/lib/utils";

type RiskIndicatorProps = {
  riskLevel: string;
  deadlineRiskScore: number;
  suggestions?: string[];
};

export function RiskIndicator({
  riskLevel,
  deadlineRiskScore,
  suggestions = [],
}: RiskIndicatorProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deadline risk</CardTitle>
        <Badge className={riskBg(riskLevel)}>
          <span className={riskColor(riskLevel)}>{riskLevel}</span>
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{deadlineRiskScore}</p>
            <p className="text-sm text-muted">Risk score / 100</p>
          </div>
        </div>
        {suggestions.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">AI suggestions</p>
            <ul className="space-y-1 text-sm text-muted">
              {suggestions.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
