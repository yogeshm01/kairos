import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Rocket } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { MissionAnalyzing } from "@/components/mission/MissionAnalyzing";
import { GlowPanel } from "@/components/ui/glow-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAIProfile, useCreateMission } from "@/hooks/useMissions";
import type { MissionPlanResponse } from "@/types/api";

const STEPS = [
  { key: "title", question: "What mission are you trying to accomplish?", placeholder: "Land a Google internship", type: "text" },
  { key: "deadline", question: "When must it be completed?", type: "date" },
  { key: "why", question: "Why is this mission important to you?", placeholder: "This changes my career trajectory...", type: "textarea" },
  { key: "situation", question: "Describe your current situation.", placeholder: "Starting point, constraints, context...", type: "textarea" },
  { key: "effort", question: "What's your estimated total effort? (optional)", placeholder: "e.g., 40 hours, 2 weeks, etc.", type: "text" },
  { key: "constraints", question: "Any constraints or preferences? (optional)", placeholder: "Budget limits, specific tools, team requirements...", type: "textarea" },
] as const;

type FormData = {
  title: string;
  deadline: string;
  why: string;
  situation: string;
  effort: string;
  constraints: string;
};

export function NewMissionPage() {
  const navigate = useNavigate();
  const createMission = useCreateMission();
  const { data: aiProfile } = useAIProfile();
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [result, setResult] = useState<MissionPlanResponse | null>(null);
  const [form, setForm] = useState<FormData>({
    title: "",
    deadline: "",
    why: "",
    situation: "",
    effort: "",
    constraints: "",
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
      case "effort":
      case "constraints":
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
        // AI Profile will provide defaults for available_minutes_per_day and intensity_preference
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
      <div className="min-h-screen bg-[#050608] flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(110,231,255,0.08),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(52,211,153,0.04),transparent)]" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="max-w-2xl w-full relative z-10">
          <MissionAnalyzing
            active
            apiDone={apiDone}
            onComplete={() => {
              if (result) navigate(`/missions/${result.mission.id}`);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(110,231,255,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(52,211,153,0.04),transparent)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">New Mission</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Create Your Mission</span>
          </h1>
          <p className="text-gray-400">AI will build your execution plan</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-gradient-to-r from-cyan-500 to-emerald-500" : "bg-white/10"
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
            <GlowPanel className="panel-glow-accent p-8 md:p-12 rounded-3xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-400">
                  Step {step + 1} of {STEPS.length}
                </p>
              </div>
              
              <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">
                {current.question}
              </h2>

              <div className="mt-8">
                {current.type === "text" ? (
                  <Input
                    autoFocus
                    className="h-14 text-lg bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl"
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
                    className="h-14 text-lg bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                ) : null}

                {current.type === "textarea" ? (
                  <Textarea
                    autoFocus
                    className="min-h-[120px] text-base bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl resize-none"
                    placeholder={current.placeholder}
                    value={
                      current.key === "why" ? form.why 
                      : current.key === "situation" ? form.situation 
                      : current.key === "constraints" ? form.constraints 
                      : ""
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [current.key === "why" ? "why" : current.key === "situation" ? "situation" : "constraints"]: e.target.value,
                      })
                    }
                  />
                ) : null}

                {current.key === "effort" ? (
                  <Input
                    autoFocus
                    className="h-14 text-lg bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl"
                    placeholder={current.placeholder}
                    value={form.effort}
                    onChange={(e) => setForm({ ...form, effort: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && canContinue() && handleNext()}
                  />
                ) : null}
              </div>

              {createMission.error ? (
                <p className="mt-4 text-sm text-red-400">{createMission.error.message}</p>
              ) : null}

              <button
                type="button"
                disabled={!canContinue()}
                onClick={handleNext}
                className="mt-10 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-40"
              >
                {step === STEPS.length - 1 ? "Launch AI Analysis" : "Continue"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </GlowPanel>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
