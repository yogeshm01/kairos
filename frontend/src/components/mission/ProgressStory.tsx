import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GlowPanel } from "@/components/ui/glow-panel";

type ProgressStoryProps = {
  confidenceScore: number;
  completionRate: number;
  riskScore: number;
  daysRemaining: number;
  weeklyScores?: number[];
};

export function ProgressStory({
  confidenceScore,
  completionRate,
  riskScore,
  daysRemaining,
  weeklyScores = [],
}: ProgressStoryProps) {
  const trendData =
    weeklyScores.length > 0
      ? weeklyScores.map((s, i) => ({ day: `W${i + 1}`, confidence: s }))
      : [
          { day: "Start", confidence: Math.max(confidenceScore - 15, 20) },
          { day: "Now", confidence: confidenceScore },
          {
            day: "Goal",
            confidence: Math.min(confidenceScore + Math.round((1 - completionRate) * 20), 95),
          },
        ];

  return (
    <GlowPanel className="p-6 md:p-8">
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        Mission Trajectory
      </h3>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <MiniStat label="Progress" value={`${Math.round(completionRate * 100)}%`} />
        <MiniStat label="Confidence" value={`${confidenceScore}%`} />
        <MiniStat label="Risk" value={`${riskScore}`} />
        <MiniStat label="Runway" value={`${daysRemaining}d`} />
      </div>

      <div className="mt-8 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6ee7ff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6ee7ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" vertical={false} />
            <XAxis dataKey="day" stroke="#8b93a7" fontSize={11} tickLine={false} />
            <YAxis stroke="#8b93a7" fontSize={11} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "#0c0e14",
                border: "1px solid #1e2330",
                borderRadius: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="#6ee7ff"
              fill="url(#confGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlowPanel>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
