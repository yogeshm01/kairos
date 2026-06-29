import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { GlowPanel } from "@/components/ui/glow-panel";
import { Input } from "@/components/ui/input";
import type { Reflection } from "@/types/api";
import { formatDate } from "@/lib/utils";

type ReflectionChatProps = {
  reflections: Reflection[];
  onSubmit: (data: {
    reflection_date: string;
    completed_summary?: string;
    blockers?: string;
    confidence: number;
    energy: number;
    notes?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

type Step = "productivity" | "blockers" | "feeling" | "summary";

export function ReflectionChat({ reflections, onSubmit, isSubmitting }: ReflectionChatProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [step, setStep] = useState<Step>("productivity");
  const [productivity, setProductivity] = useState("");
  const [blockers, setBlockers] = useState("");
  const [energy, setEnergy] = useState(3);
  const [confidence, setConfidence] = useState(60);

  const questions: Record<Step, string> = {
    productivity: "How productive were you today?",
    blockers: "What blocked you?",
    feeling: "How did you feel? (energy 1–5)",
    summary: "Here's what I learned...",
  };

  async function finish() {
    await onSubmit({
      reflection_date: today,
      completed_summary: productivity,
      blockers,
      confidence,
      energy,
    });
    setStep("productivity");
    setProductivity("");
    setBlockers("");
  }

  return (
    <GlowPanel className="p-6 md:p-8">
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Reflection</h3>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-6 space-y-4"
        >
          <p className="text-lg font-medium">{questions[step]}</p>

          {step === "productivity" ? (
            <>
              <Input
                placeholder="I completed..."
                value={productivity}
                onChange={(e) => setProductivity(e.target.value)}
                autoFocus
              />
              <Button onClick={() => setStep("blockers")} disabled={!productivity.trim()}>
                Continue
              </Button>
            </>
          ) : null}

          {step === "blockers" ? (
            <>
              <Input
                placeholder="Distractions, time, energy..."
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                autoFocus
              />
              <Button onClick={() => setStep("feeling")}>Continue</Button>
            </>
          ) : null}

          {step === "feeling" ? (
            <>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEnergy(n)}
                    className={`h-12 w-12 rounded-xl border text-lg font-medium transition ${
                      energy === n
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted hover:border-accent/30"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted">Confidence in mission (0–100)</p>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                />
              </div>
              <Button onClick={() => setStep("summary")}>Continue</Button>
            </>
          ) : null}

          {step === "summary" ? (
            <>
              <p className="text-sm text-muted leading-relaxed">
                You reported {energy}/5 energy and {confidence}% confidence.
                {blockers ? ` Main blocker: ${blockers}.` : ""} I&apos;ll adapt tomorrow&apos;s
                plan.
              </p>
              <Button onClick={() => void finish()} disabled={isSubmitting}>
                {isSubmitting ? "Learning..." : "Save reflection"}
              </Button>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {reflections.length ? (
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Recent</p>
          <div className="mt-3 space-y-2">
            {reflections.slice(0, 2).map((r) => (
              <p key={r.id} className="text-sm text-muted">
                {formatDate(r.reflection_date)} — {r.ai_insight ?? "Logged"}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </GlowPanel>
  );
}
