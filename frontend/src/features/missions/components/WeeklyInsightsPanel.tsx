import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyInsightsResponse } from "@/types/api";

type WeeklyInsightsPanelProps = {
  data?: WeeklyInsightsResponse;
  isLoading?: boolean;
};

export function WeeklyInsightsPanel({ data, isLoading }: WeeklyInsightsPanelProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Loading insights...</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.confidence_scores.map((score, index) => ({
    label: `W${index + 1}`,
    score: Math.round(score),
    completion: Math.round((data.task_completion_rates[index] ?? 0) * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted">
          {data.week_start} → {data.week_end}
        </p>
        <p className="text-sm">{data.insights.confidence_trend}</p>
        <p className="text-sm font-medium text-accent">{data.insights.next_week_focus}</p>

        {chartData.length ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="label" stroke="#9aa3b2" fontSize={12} />
                <YAxis stroke="#9aa3b2" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#11131a",
                    border: "1px solid #252936",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#7dd3fc" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {data.insights.repeated_blockers.length ? (
          <div>
            <p className="text-sm font-medium">Repeated blockers</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {data.insights.repeated_blockers.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
