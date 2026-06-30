import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Clock, Coffee, Target, Zap, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { GlowPanel } from "@/components/ui/glow-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAIProfile, useCompleteOnboarding, useCreateAIProfile } from "@/hooks/useMissions";
import type { WorkStyle, ReminderStyle, FocusEnvironment } from "@/types/api";
import type { LucideIcon } from "lucide-react";

type StepConfig = {
  key: string;
  question: string;
  icon: LucideIcon;
  type?: "text" | "time" | "hours" | "workStyle" | "reminderStyle" | "focusEnvironment" | "textarea";
  placeholder?: string;
};

const STEPS: StepConfig[] = [
  { key: "occupation", question: "What do you do for work?", placeholder: "Software engineer, student, designer...", icon: Target },
  { key: "dailyTime", question: "How much time can you dedicate daily?", type: "time", icon: Clock },
  { key: "productiveHours", question: "When are you most productive?", type: "hours", icon: Zap },
  { key: "workStyle", question: "How do you prefer to work?", type: "workStyle", icon: Coffee },
  { key: "reminderStyle", question: "How should we remind you?", type: "reminderStyle", icon: Coffee },
  { key: "focusEnvironment", question: "Where do you work best?", type: "focusEnvironment", icon: Coffee },
  { key: "distractions", question: "What usually distracts you?", placeholder: "Social media, notifications, noise...", type: "textarea", icon: Coffee },
  { key: "goals", question: "What motivates you?", placeholder: "Career growth, learning new skills, personal projects...", type: "textarea", icon: Target },
];

const TIME_OPTIONS = [30, 60, 90, 120, 180, 240, 300]; // in minutes
const HOUR_OPTIONS = [
  { label: "Early Bird (6AM-12PM)", start: 6, end: 12 },
  { label: "Morning (9AM-1PM)", start: 9, end: 13 },
  { label: "Afternoon (1PM-5PM)", start: 13, end: 17 },
  { label: "Evening (5PM-9PM)", start: 17, end: 21 },
  { label: "Night Owl (9PM-1AM)", start: 21, end: 1 },
];

const WORK_STYLE_OPTIONS: { label: string; value: WorkStyle; description: string }[] = [
  { label: "Morning Person", value: "morning_person", description: "I'm most productive in the morning" },
  { label: "Night Owl", value: "night_owl", description: "I work best late at night" },
  { label: "Flexible", value: "flexible", description: "I can work anytime" },
  { label: "Burst Worker", value: "burst_worker", description: "I work in intense focused sessions" },
];

const REMINDER_STYLE_OPTIONS: { label: string; value: ReminderStyle; description: string }[] = [
  { label: "Gentle", value: "gentle", description: "Soft, friendly reminders" },
  { label: "Direct", value: "direct", description: "Clear, straightforward reminders" },
  { label: "Motivational", value: "motivational", description: "Inspiring, encouraging reminders" },
  { label: "Minimal", value: "minimal", description: "Just the essentials" },
];

const FOCUS_ENVIRONMENT_OPTIONS: { label: string; value: FocusEnvironment; description: string }[] = [
  { label: "Quiet Space", value: "quiet", description: "Complete silence preferred" },
  { label: "Background Noise", value: "background_noise", description: "Cafe sounds, white noise" },
  { label: "Music", value: "music", description: "Lo-fi, instrumental, focus music" },
  { label: "Cafe", value: "cafe", description: "Public spaces with ambient activity" },
  { label: "Varies", value: "varies", description: "Different environments work for me" },
];

type FormData = {
  occupation: string;
  daily_available_minutes: number;
  productive_hours_start: number;
  productive_hours_end: number;
  work_style: WorkStyle;
  reminder_style: ReminderStyle;
  focus_environment: FocusEnvironment;
  common_distractions: string;
  goals_and_motivations: string;
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { data: existingProfile } = useAIProfile();
  const createProfile = useCreateAIProfile();
  const completeOnboarding = useCompleteOnboarding();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    occupation: "",
    daily_available_minutes: 120,
    productive_hours_start: 9,
    productive_hours_end: 17,
    work_style: "flexible",
    reminder_style: "gentle",
    focus_environment: "quiet",
    common_distractions: "",
    goals_and_motivations: "",
  });

  // Skip onboarding if already completed
  if (existingProfile?.onboarding_completed) {
    navigate("/dashboard");
    return null;
  }

  const current = STEPS[step];

  function canContinue() {
    switch (current.key) {
      case "occupation":
        return form.occupation.trim().length >= 2;
      case "dailyTime":
        return form.daily_available_minutes > 0;
      case "productiveHours":
        return true;
      case "workStyle":
      case "reminderStyle":
      case "focusEnvironment":
        return true;
      case "distractions":
      case "goals":
        return true;
      default:
        return false;
    }
  }

  function getStepType(): string {
    return current.type || "text";
  }

  function getPlaceholder(): string {
    return current.placeholder || "";
  }

  async function handleComplete() {
    try {
      if (existingProfile) {
        // Update existing profile
        await createProfile.mutateAsync(form);
      } else {
        // Create new profile
        await createProfile.mutateAsync(form);
      }
      await completeOnboarding.mutateAsync();
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      void handleComplete();
    }
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">AI Profile Setup</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Personalize Your Experience</span>
          </h1>
          <p className="text-gray-400">Help us understand how you work best</p>
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
                  {React.createElement(current.icon, { className: "h-6 w-6 text-cyan-400" })}
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-400">
                  Step {step + 1} of {STEPS.length}
                </p>
              </div>
              
              <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">
                {current.question}
              </h2>

              <div className="mt-8">
                {getStepType() === "text" ? (
                  <Input
                    autoFocus
                    className="h-14 text-lg bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl"
                    placeholder={getPlaceholder()}
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && canContinue() && handleNext()}
                  />
                ) : null}

                {getStepType() === "time" ? (
                  <div className="grid grid-cols-4 gap-3">
                    {TIME_OPTIONS.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setForm({ ...form, daily_available_minutes: minutes })}
                        className={`rounded-xl border py-4 text-center transition-all duration-200 ${
                          form.daily_available_minutes === minutes
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-white/10 bg-white/5 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className="text-2xl font-semibold">{minutes}</div>
                        <div className="text-xs text-gray-400">min</div>
                      </button>
                    ))}
                  </div>
                ) : null}

                {getStepType() === "hours" ? (
                  <div className="grid gap-3">
                    {HOUR_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setForm({ 
                          ...form, 
                          productive_hours_start: option.start,
                          productive_hours_end: option.end
                        })}
                        className={`rounded-xl border px-6 py-4 text-left transition-all duration-200 ${
                          form.productive_hours_start === option.start && form.productive_hours_end === option.end
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:border-cyan-500/30"
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {getStepType() === "workStyle" ? (
                  <div className="grid gap-3">
                    {WORK_STYLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm({ ...form, work_style: option.value })}
                        className={`rounded-xl border px-6 py-4 text-left transition-all duration-200 ${
                          form.work_style === option.value
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {form.work_style === option.value && (
                            <Check className="h-5 w-5 text-cyan-400" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{option.description}</p>
                      </button>
                    ))}
                  </div>
                ) : null}

                {getStepType() === "reminderStyle" ? (
                  <div className="grid gap-3">
                    {REMINDER_STYLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm({ ...form, reminder_style: option.value })}
                        className={`rounded-xl border px-6 py-4 text-left transition-all duration-200 ${
                          form.reminder_style === option.value
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {form.reminder_style === option.value && (
                            <Check className="h-5 w-5 text-cyan-400" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{option.description}</p>
                      </button>
                    ))}
                  </div>
                ) : null}

                {getStepType() === "focusEnvironment" ? (
                  <div className="grid gap-3">
                    {FOCUS_ENVIRONMENT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm({ ...form, focus_environment: option.value })}
                        className={`rounded-xl border px-6 py-4 text-left transition-all duration-200 ${
                          form.focus_environment === option.value
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {form.focus_environment === option.value && (
                            <Check className="h-5 w-5 text-cyan-400" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{option.description}</p>
                      </button>
                    ))}
                  </div>
                ) : null}

                {getStepType() === "textarea" ? (
                  <Textarea
                    autoFocus
                    className="min-h-[120px] text-base bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl resize-none"
                    placeholder={getPlaceholder()}
                    value={current.key === "distractions" ? form.common_distractions : form.goals_and_motivations}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [current.key === "distractions" ? "common_distractions" : "goals_and_motivations"]: e.target.value,
                      })
                    }
                  />
                ) : null}
              </div>

              {createProfile.error ? (
                <p className="mt-4 text-sm text-red-400">{createProfile.error.message}</p>
              ) : null}

              <button
                type="button"
                disabled={!canContinue() || createProfile.isPending || completeOnboarding.isPending}
                onClick={handleNext}
                className="mt-10 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-40"
              >
                {createProfile.isPending || completeOnboarding.isPending ? (
                  "Saving..."
                ) : step === STEPS.length - 1 ? (
                  "Complete Setup"
                ) : (
                  "Continue"
                )}
                <ArrowRight className="h-5 w-5" />
              </button>
            </GlowPanel>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
