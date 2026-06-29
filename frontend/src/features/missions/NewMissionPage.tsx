import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { MissionAnalyzing } from "@/components/mission/MissionAnalyzing";
import { GlowPanel } from "@/components/ui/glow-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMission } from "@/hooks/useMissions";
import type { IntensityPreference, MissionPlanResponse } from "@/types/api";

const STEPS = [
  { key: "title", question: "What mission are you trying to accomplish?", placeholder: "Land a Google internship", type: "text" },
  { key: "deadline", question: "When must it be completed?", type: "date" },
  { key: "why", question: "Why is this mission important to you?", placeholder: "This changes my career trajectory...", type: "textarea" },
  { key: "situation", question: "Describe your current situation.", placeholder: "Starting point, constraints, context...", type: "textarea" },
  { key: "hours", question: "How many hours can you realistically dedicate every day?", type: "hours" },
  { key: "intensity", question: "Preferred intensity", type: "intensity" },
] as const;

const HOUR_PRESETS = [1, 1.5, 2, 2.5, 3, 4, 5, 6];

const INTENSITY_OPTIONS: { label: string; value: IntensityPreference }[] = [
  { label: "Relaxed", value: "light" },
  { label: "Balanced", value: "balanced" },
  { label: "Aggressive", value: "intense" },
];

type FormData = {
  title: string;
  deadline: string;
  why: string;
  situation: string;
  hours: number;
  intensity: IntensityPreference;
};

export function NewMissionPage() {
  const navigate = useNavigate();
  const createMission = useCreateMission();
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [result, setResult] = useState<MissionPlanResponse | null>(null);
  const [form, setForm] = useState<FormData>({
    title: "",
    deadline: "",
    why: "",
    situation: "",
    hours: 2,
    intensity: "balanced",
  });

  const current = STEPS[step]!;

  function canContinue() {
    switch (current.key) {
      case "title":
        return form.title.trim().length >= 3;
      case "deadline":
        return Boolean(form.deadline);
      case "why":
        return form.why.trim().length >= 10;
      case "situation":
        return true;
      case "hours":
        return form.hours > 0;
      case "intensity":
        return true;
      default:
        return false;
    }
  }

  async function launch() {
    setAnalyzing(true);
    setApiDone(false);

    try {
      const res = await createMission.mutateAsync({
        title: form.title,
        deadline: form.deadline,
        why_it_matters: form.why,
        description: form.situation || undefined,
        available_minutes_per_day: Math.round(form.hours * 60),
        intensity_preference: form.intensity,
      });
      setResult(res);
      setApiDone(true);
    } catch {
      setAnalyzing(false);
    }
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      void launch();
    }
  }

  if (analyzing) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <MissionAnalyzing
          active
          apiDone={apiDone}
          onComplete={() => {
            if (result) navigate(`/missions/${result.mission.id}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center py-8">
      <Link
        to="/dashboard"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mb-6 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition ${
              i <= step ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlowPanel className="p-8 md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
              {current.question}
            </h2>

            <div className="mt-8">
              {current.type === "text" ? (
                <Input
                  autoFocus
                  className="h-14 text-lg"
                  placeholder={current.placeholder}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && canContinue() && handleNext()}
                />
              ) : null}

              {current.type === "date" ? (
                <Input
                  autoFocus
                  type="date"
                  className="h-14 text-lg"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              ) : null}

              {current.type === "textarea" ? (
                <Textarea
                  autoFocus
                  className="min-h-[120px] text-base"
                  placeholder={current.placeholder}
                  value={current.key === "why" ? form.why : form.situation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [current.key === "why" ? "why" : "situation"]: e.target.value,
                    })
                  }
                />
              ) : null}

              {current.type === "hours" ? (
                <div className="grid grid-cols-4 gap-3">
                  {HOUR_PRESETS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setForm({ ...form, hours: h })}
                      className={`rounded-xl border py-4 text-center transition ${
                        form.hours === h
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/30"
                      }`}
                    >
                      <div className="text-2xl font-semibold">{h}</div>
                      <div className="text-xs text-muted">hours</div>
                    </button>
                  ))}
                </div>
              ) : null}

              {current.type === "intensity" ? (
                <div className="grid gap-3">
                  {INTENSITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, intensity: opt.value })}
                      className={`rounded-xl border px-6 py-4 text-left transition ${
                        form.intensity === opt.value
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/30"
                      }`}
                    >
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {createMission.error ? (
              <p className="mt-4 text-sm text-danger">{createMission.error.message}</p>
            ) : null}

            <button
              type="button"
              disabled={!canContinue()}
              onClick={handleNext}
              className="mt-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent font-medium text-background transition hover:bg-sky-300 disabled:opacity-40"
            >
              {step === STEPS.length - 1 ? "Launch AI Analysis" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </GlowPanel>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
