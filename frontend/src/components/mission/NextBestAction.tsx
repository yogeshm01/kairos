import { motion } from "framer-motion";
import { ArrowRight, Clock, Target, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlowPanel } from "@/components/ui/glow-panel";
import { estimateImpact } from "@/lib/missionIntel";
import { priorityLabel } from "@/lib/utils";

type NextBestActionProps = {
  title: string;
  minutes: number;
  priority: string;
  impact: number;
  rationale?: string;
  onStart?: () => void;
  isStarting?: boolean;
};

export function NextBestAction({
  title,
  minutes,
  priority,
  impact,
  rationale,
  onStart,
  isStarting,
}: NextBestActionProps) {
  return (
    <GlowPanel accent className="p-8 md:p-10">
      <div id="action" className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">
              Next Best Action
            </p>
            <p className="mt-2 text-sm text-muted">Today&apos;s highest-impact move</p>
          </div>

          <motion.h2
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-semibold tracking-tight md:text-4xl"
          >
            {title}
          </motion.h2>

          <div className="flex flex-wrap gap-6 text-sm">
            <Stat icon={Clock} label="Est. time" value={`${minutes} min`} />
            <Stat icon={Target} label="Impact" value={`+${impact}% confidence`} accent />
            <Stat icon={Zap} label="Difficulty" value={priorityLabel(priority)} />
          </div>

          {rationale ? (
            <p className="max-w-xl text-muted leading-relaxed">{rationale}</p>
          ) : null}
        </div>

        <Button
          size="lg"
          className="h-14 shrink-0 px-8 text-base shadow-glow-sm"
          onClick={onStart}
          disabled={isStarting}
        >
          <Zap className="h-5 w-5" />
          Start Now
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </GlowPanel>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-muted"}`} />
      <span className="text-muted">{label}</span>
      <span className={accent ? "font-medium text-accent" : "font-medium"}>{value}</span>
    </div>
  );
}

export function computeActionImpact(confidence: number, priority: string) {
  return estimateImpact(confidence, priority);
}
