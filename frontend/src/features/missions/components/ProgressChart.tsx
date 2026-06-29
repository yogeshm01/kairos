import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProgressChartProps = {
  completedTasks: number;
  totalTasks: number;
  completedMilestones: number;
  totalMilestones: number;
  confidenceScore: number;
};

export function ProgressChart({
  completedTasks,
  totalTasks,
  completedMilestones,
  totalMilestones,
  confidenceScore,
}: ProgressChartProps) {
  const data = [
    {
      name: "Tasks",
      completed: completedTasks,
      remaining: Math.max(totalTasks - completedTasks, 0),
    },
    {
      name: "Milestones",
      completed: completedMilestones,
      remaining: Math.max(totalMilestones - completedMilestones, 0),
    },
    {
      name: "Confidence",
      completed: confidenceScore,
      remaining: Math.max(100 - confidenceScore, 0),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress overview</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252936" />
            <XAxis dataKey="name" stroke="#9aa3b2" fontSize={12} />
            <YAxis stroke="#9aa3b2" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#11131a",
                border: "1px solid #252936",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="completed" fill="#7dd3fc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
