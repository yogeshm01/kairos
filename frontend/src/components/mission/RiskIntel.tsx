import { AlertTriangle, ArrowRight } from "lucide-react";

import { GlowPanel } from "@/components/ui/glow-panel";
import { formatCountdown } from "@/lib/missionIntel";
import { riskColor } from "@/lib/utils";

type RiskIntelProps = {
  riskLevel: string;
  score: number;
  daysRemaining: number;
  deadline: string;
  causes: string[];
  topMitigation: string;
};

export function RiskIntel({
  riskLevel,
  score,
  daysRemaining,
  deadline,
  causes,
  topMitigation,
}: RiskIntelProps) {
  return (
    <GlowPanel className="p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Deadline Risk</p>
          <p className={`mt-2 text-3xl font-semibold capitalize ${riskColor(riskLevel)}`}>
            {riskLevel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{score}</p>
          <p className="text-xs text-muted">/ 100</p>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-sm text-muted">
        <span>{formatCountdown(deadline)}</span>
        <span>·</span>
        <span>{daysRemaining} days remain</span>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Why</p>
        {causes.map((c) => (
          <div key={c} className="flex items-start gap-2 text-sm">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <span className="text-muted">{c}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          Reduces risk most
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm font-medium">
          {topMitigation}
          <ArrowRight className="h-4 w-4 text-accent" />
        </p>
      </div>
    </GlowPanel>
  );
}
