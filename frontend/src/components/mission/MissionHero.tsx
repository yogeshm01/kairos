import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import { GlowPanel } from "@/components/ui/glow-panel";
import { formatCountdown, hoursPerDay } from "@/lib/missionIntel";
import { cn, riskColor } from "@/lib/utils";
import type { Mission, MissionDashboard } from "@/types/api";

type MissionHeroProps = {
  mission: Mission;
  dashboard: MissionDashboard;
  missionId: string;
};

export function MissionHero({ mission, dashboard, missionId }: MissionHeroProps) {
  const confidence = dashboard.confidence_score;
  const trend =
    dashboard.confidence_trend === "improving"
      ? "↑"
      : dashboard.confidence_trend === "declining"
        ? "↓"
        : "→";

  return (
    <GlowPanel accent className="relative overflow-hidden p-8 md:p-12">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-accent">
            Active Mission
          </span>
          <span>{mission.status.replace("_", " ")}</span>
        </div>

        <div className="space-y-3">
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight md:text-5xl">{mission.title}</h1>
          {mission.why_it_matters ? (
            <p className="max-w-2xl text-lg text-muted">{mission.why_it_matters}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-8 md:gap-12">
          <Metric label="Confidence" value={`${confidence}%`} sub={trend} highlight />
          <Metric
            label="Deadline"
            value={formatCountdown(mission.deadline)}
            sub={`${dashboard.progress.days_remaining}d`}
          />
          <Metric
            label="Risk"
            value={dashboard.risk_level}
            sub={`${dashboard.deadline_risk_score}/100`}
            valueClass={riskColor(dashboard.risk_level)}
          />
          <Metric label="Daily capacity" value={`${hoursPerDay(mission)}h`} sub="committed" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/missions/${missionId}#action`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-sm font-medium text-background shadow-glow-sm transition hover:bg-sky-300"
          >
            <Zap className="h-4 w-4" />
            Start Today&apos;s Mission
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={`/missions/${missionId}`}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium transition hover:bg-surface-elevated"
          >
            Open Command Center
          </Link>
        </div>
      </div>
    </GlowPanel>
  );
}

function Metric({
  label,
  value,
  sub,
  highlight,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-3xl font-semibold tabular-nums tracking-tight",
          highlight && "text-gradient",
          valueClass,
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-sm text-muted">{sub}</p> : null}
    </div>
  );
}
