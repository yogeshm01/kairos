import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Coffee, Save, Target, Zap, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { GlowPanel } from "@/components/ui/glow-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAIProfile, useUpdateAIProfile } from "@/hooks/useMissions";
import type { WorkStyle, ReminderStyle, FocusEnvironment } from "@/types/api";
import type { LucideIcon } from "lucide-react";

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

type SectionConfig = {
  key: string;
  title: string;
  icon: LucideIcon;
  type?: "text" | "time" | "hours" | "workStyle" | "reminderStyle" | "focusEnvironment" | "textarea";
  placeholder?: string;
};

const SECTIONS: SectionConfig[] = [
  { key: "occupation", title: "Occupation", placeholder: "Software engineer, student, designer...", icon: Target },
  { key: "dailyTime", title: "Daily Available Time", type: "time", icon: Clock },
  { key: "productiveHours", title: "Productive Hours", type: "hours", icon: Zap },
  { key: "workStyle", title: "Work Style", type: "workStyle", icon: Coffee },
  { key: "reminderStyle", title: "Reminder Style", type: "reminderStyle", icon: Coffee },
  { key: "focusEnvironment", title: "Focus Environment", type: "focusEnvironment", icon: Coffee },
  { key: "distractions", title: "Common Distractions", placeholder: "Social media, notifications, noise...", type: "textarea", icon: Coffee },
  { key: "goals", title: "Goals & Motivations", placeholder: "Career growth, learning new skills, personal projects...", type: "textarea", icon: Target },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useAIProfile();
  const updateProfile = useUpdateAIProfile();
  const [form, setForm] = useState({
    occupation: "",
    daily_available_minutes: 120,
    productive_hours_start: 9,
    productive_hours_end: 17,
    work_style: "flexible" as WorkStyle,
    reminder_style: "gentle" as ReminderStyle,
    focus_environment: "quiet" as FocusEnvironment,
    common_distractions: "",
    goals_and_motivations: "",
  });

  // Initialize form with existing profile data
  React.useEffect(() => {
    if (profile) {
      setForm({
        occupation: profile.occupation || "",
        daily_available_minutes: profile.daily_available_minutes || 120,
        productive_hours_start: profile.productive_hours_start || 9,
        productive_hours_end: profile.productive_hours_end || 17,
        work_style: profile.work_style || "flexible",
        reminder_style: profile.reminder_style || "gentle",
        focus_environment: profile.focus_environment || "quiet",
        common_distractions: profile.common_distractions || "",
        goals_and_motivations: profile.goals_and_motivations || "",
      });
    }
  }, [profile]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading profile...</div>;
  }

  async function handleSave() {
    try {
      await updateProfile.mutateAsync(form);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#050608] py-12 px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(110,231,255,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(52,211,153,0.04),transparent)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300">AI Profile</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Profile Settings</span>
            </h1>
            <p className="text-gray-400">
              Customize how Kairos works with you. These settings help personalize your mission plans.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <GlowPanel key={section.key} className="panel-glow p-6 md:p-8 rounded-3xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
                  {React.createElement(section.icon, { className: "h-6 w-6 text-cyan-400" })}
                </div>
                <h3 className="text-xl font-semibold">{section.title}</h3>
              </div>

              {section.type === "text" ? (
                <Input
                  placeholder={section.placeholder}
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  className="h-14 text-lg bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl"
                />
              ) : null}

              {section.type === "time" ? (
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

              {section.type === "hours" ? (
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

              {section.type === "workStyle" ? (
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
                      <span className="font-medium">{option.label}</span>
                      <p className="mt-1 text-sm text-gray-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              {section.type === "reminderStyle" ? (
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
                      <span className="font-medium">{option.label}</span>
                      <p className="mt-1 text-sm text-gray-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              {section.type === "focusEnvironment" ? (
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
                      <span className="font-medium">{option.label}</span>
                      <p className="mt-1 text-sm text-gray-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              {section.type === "textarea" ? (
                <Textarea
                  placeholder={section.placeholder}
                  className="min-h-[120px] text-base bg-white/5 border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl resize-none"
                  value={section.key === "distractions" ? form.common_distractions : form.goals_and_motivations}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [section.key === "distractions" ? "common_distractions" : "goals_and_motivations"]: e.target.value,
                    })
                  }
                />
              ) : null}
            </GlowPanel>
          ))}

          <button
            type="button"
            disabled={updateProfile.isPending}
            onClick={handleSave}
            className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-40"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
            <Save className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
