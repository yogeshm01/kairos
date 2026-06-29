import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

import { GlowPanel } from "@/components/ui/glow-panel";
import { Progress } from "@/components/ui/progress";

type ConfidenceIntelProps = {
  score: number;
  trend: string;
  reasons: string[];
};

export function ConfidenceIntel({ score, trend, reasons }: ConfidenceIntelProps) {
  const delta =
    trend === "improving" ? "+5" : trend === "declining" ? "-5" : "0";
  const TrendIcon = trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : null;

  return (
    <GlowPanel className="p-6 md:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        Mission Confidence
      </p>

      <div className="mt-6 flex items-end gap-3">
        <motion.span
          key={score}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-semibold tabular-nums tracking-tight text-gradient"
        >
          {score}%
        </motion.span>
        {TrendIcon ? (
          <div
            className={`mb-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ${
              trend === "improving" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            <TrendIcon className="h-4 w-4" />
            {delta} today
          </div>
        ) : null}
      </div>

      <Progress value={score} className="mt-6 h-1.5" />

      {reasons.length ? (
        <div className="mt-6 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Because</p>
          <ul className="space-y-1.5">
            {reasons.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </GlowPanel>
  );
}
