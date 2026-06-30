import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, RefreshCw, Edit2, CheckCircle2, Target, Sparkles, Clock3, ArrowRight } from "lucide-react";

import { AiActivityFeed } from "@/components/mission/AiActivityFeed";
import { CoachBrief } from "@/components/mission/CoachBrief";
import { ConfidenceIntel } from "@/components/mission/ConfidenceIntel";
import { ConfidenceSimulator } from "@/components/mission/ConfidenceSimulator";
import { ExecutionGraph } from "@/components/mission/ExecutionGraph";
import { ExecutionTimeline } from "@/components/mission/ExecutionTimeline";
import { computeActionImpact, NextBestAction } from "@/components/mission/NextBestAction";
import { MissionReplay } from "@/components/mission/MissionReplay";
import { ProgressStory } from "@/components/mission/ProgressStory";
import { RecoveryMode } from "@/components/mission/RecoveryMode";
import { ReflectionChat } from "@/components/mission/ReflectionChat";
import { RiskIntel } from "@/components/mission/RiskIntel";
import { GlowPanel } from "@/components/ui/glow-panel";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/hooks/useAuth";
import {
  useApplyRecoveryPlan,
  useCoachMessage,
  useCreateReflection,
  useDeleteMission,
  useDeleteTask,
  useMissionDashboard,
  useRecoveryPlan,
  useRegenerateMission,
  useUpdateTaskStatus,
  useWeeklyInsights,
} from "@/hooks/useMissions";
import {
  buildActivityFeed,
  buildConfidenceReasons,
  buildReplayEvents,
  buildRiskExplanation,
  getPrimaryAction,
  hasMissedWork,
  formatCountdown,
  hoursPerDay,
} from "@/lib/missionIntel";
import { riskColor } from "@/lib/utils";
import type { DashboardTask, RecoveryPlanResponse, Task } from "@/types/api";

function getDisplayTask(tasks: DashboardTask[], focusTaskId?: string) {
  const sorted = [...tasks].sort((a, b) => (a.task.order_index ?? 0) - (b.task.order_index ?? 0));
  if (focusTaskId) {
    const selected = sorted.find((item) => item.task.id === focusTaskId);
    if (selected) return selected;
  }

  return sorted.find((item) => item.task.status === "in_progress")
    ?? sorted.find((item) => item.task.status === "pending")
    ?? sorted[0];
}

function getNextPendingTask(tasks: DashboardTask[], completedTaskId?: string) {
  const remaining = tasks.filter((item) => item.task.id !== completedTaskId);
  return remaining.find((item) => item.task.status === "in_progress")
    ?? remaining.find((item) => item.task.status === "pending")
    ?? remaining[0];
}

function getTaskLabel(task: Task) {
  if (task.status === "completed") return "Completed";
  if (task.status === "skipped") return "Skipped";
  if (task.status === "in_progress") return "In progress";
  return "Pending";
}

export function MissionDashboardPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const user = useAuthUser();
  const { data, isLoading, error } = useMissionDashboard(id);
  const { data: coach, isLoading: coachLoading } = useCoachMessage(id);
  const { data: weekly } = useWeeklyInsights(id);
  const updateTask = useUpdateTaskStatus(id);
  const createReflection = useCreateReflection(id);
  const generateRecovery = useRecoveryPlan(id);
  const applyRecovery = useApplyRecoveryPlan(id);
  const deleteMission = useDeleteMission();
  const deleteTask = useDeleteTask(id);
  const regenerateMission = useRegenerateMission(id);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlanResponse | undefined>();
  const [showRecovery, setShowRecovery] = useState(false);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>();

  useEffect(() => {
    setFocusTaskId(undefined);
  }, [id]);

  useEffect(() => {
    if (data && hasMissedWork(data)) {
      setShowRecovery(true);
      if (!recoveryPlan && !generateRecovery.isPending) {
        generateRecovery.mutate(undefined, { onSuccess: setRecoveryPlan });
      }
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!data?.todays_tasks?.length) {
      setFocusTaskId(undefined);
      return;
    }

    const selectedTask = getDisplayTask(data.todays_tasks, focusTaskId);
    const currentTaskId = selectedTask?.task.id;

    if (!focusTaskId || currentTaskId !== focusTaskId) {
      setFocusTaskId(currentTaskId);
    }
  }, [data?.todays_tasks, focusTaskId]);

  if (isLoading) return <PageSkeleton />;

  if (error || !data) {
    return (
      <div className="panel-glow p-8 text-danger">Failed to load mission command center.</div>
    );
  }

  const { mission, progress, upcoming_milestones, recent_reflections } = data;
  const action = getPrimaryAction(data);
  const impact = computeActionImpact(data.confidence_score, action.priority);
  const activity = buildActivityFeed(data, weekly);
  const risk = buildRiskExplanation(data);
  const replay = buildReplayEvents(mission, recent_reflections, progress);
  const focusTask = getDisplayTask(data.todays_tasks, focusTaskId);

  const handleCompleteTask = (taskId: string) => {
    updateTask.mutate(
      { taskId, status: "completed" },
      {
        onSuccess: () => {
          const nextTask = getNextPendingTask(data.todays_tasks, taskId);
          setFocusTaskId(nextTask?.task.id);
        },
      },
    );
  };

  const handleStartTask = (taskId: string) => {
    setFocusTaskId(taskId);
    updateTask.mutate({ taskId, status: "in_progress" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-20"
    >
      <Link to="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Command Center
      </Link>

      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className={riskColor(data.risk_level)}>{data.risk_level} risk</span>
            <span>·</span>
            <span>{formatCountdown(mission.deadline)}</span>
            <span>·</span>
            <span className="text-2xl font-semibold tabular-nums text-gradient">
              {data.confidence_score}%
            </span>
            <span>confidence</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowManageMenu(!showManageMenu)}
              className="rounded-lg p-2 hover:bg-accent/10"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showManageMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border/60 bg-background shadow-lg">
                <button
                  onClick={() => {
                    setShowManageMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-accent/10"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Mission
                </button>
                <button
                  onClick={() => {
                    setShowManageMenu(false);
                    void regenerateMission.mutate();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-accent/10"
                  disabled={regenerateMission.isPending}
                >
                  <RefreshCw className={`h-4 w-4 ${regenerateMission.isPending ? "animate-spin" : ""}`} />
                  Regenerate Plan
                </button>
                <button
                  onClick={() => {
                    setShowManageMenu(false);
                    if (confirm("Are you sure you want to delete this mission? This action cannot be undone.")) {
                      void deleteMission.mutate(id, {
                        onSuccess: () => {
                          navigate("/dashboard");
                        },
                      });
                    }
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-danger hover:bg-danger/10"
                  disabled={deleteMission.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Mission
                </button>
              </div>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{mission.title}</h1>
      </header>

      <RecoveryMode
        visible={showRecovery}
        plan={recoveryPlan}
        isGenerating={generateRecovery.isPending}
        isApplying={applyRecovery.isPending}
        onGenerate={() => generateRecovery.mutate(undefined, { onSuccess: setRecoveryPlan })}
        onApply={() =>
          applyRecovery.mutate(undefined, {
            onSuccess: () => {
              setRecoveryPlan(undefined);
              setShowRecovery(false);
            },
          })
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlowPanel className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
                Mission Overview
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{mission.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                {mission.description || "Keep the momentum moving with a focused daily plan."}
              </p>
            </div>
            <div className={`rounded-full border px-3 py-1 text-sm ${riskColor(data.risk_level)}`}>
              {data.risk_level} risk
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Deadline</p>
              <p className="mt-2 text-sm font-medium">{formatCountdown(mission.deadline)}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Completed</p>
              <p className="mt-2 text-sm font-medium">
                {progress.completed_tasks}/{progress.total_tasks} tasks
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Focus</p>
              <p className="mt-2 text-sm font-medium">{action.title}</p>
            </div>
          </div>
        </GlowPanel>

        <GlowPanel className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold">Current Task</h3>
            </div>
            {focusTask ? (
              <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                {getTaskLabel(focusTask.task)}
              </span>
            ) : null}
          </div>

          {focusTask ? (
            <div className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{focusTask.task.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {focusTask.why_it_matters || focusTask.task.description || "Keep a steady rhythm and move this task to completion."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">
                  {focusTask.task.estimated_minutes ? `${focusTask.task.estimated_minutes} min` : "Flexible"}
                </span>
                <span className="rounded-full bg-muted/10 px-2.5 py-1">{focusTask.task.priority} priority</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCompleteTask(focusTask.task.id)}
                  disabled={updateTask.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Complete
                </button>
                <button
                  onClick={() => handleStartTask(focusTask.task.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-foreground transition hover:bg-accent/10"
                >
                  <Clock3 className="h-4 w-4" />
                  Start Focus
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-background/30 p-6 text-center text-sm text-muted">
              You have no pending tasks right now.
            </div>
          )}
        </GlowPanel>
      </div>

      <GlowPanel className="p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Today&apos;s Tasks</h3>
          </div>
          <span className="text-sm text-muted">{data.todays_tasks.length} scheduled</span>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {data.todays_tasks.map((item) => {
            const isFocus = focusTask?.task.id === item.task.id;
            return (
              <button
                key={item.task.id}
                onClick={() => setFocusTaskId(item.task.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isFocus
                    ? "border-accent/30 bg-accent/10"
                    : "border-border/60 bg-background/40 hover:border-accent/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-medium ${item.task.status === "completed" ? "text-muted line-through" : "text-foreground"}`}>
                      {item.task.title}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {item.task.estimated_minutes ? `${item.task.estimated_minutes} min` : "Flexible"}
                    </p>
                  </div>
                  <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-muted">
                    {getTaskLabel(item.task)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </GlowPanel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <CoachBrief
            coach={coach}
            userName={user?.displayName}
            isLoading={coachLoading}
            onStartFocus={() => {
              document.getElementById("action")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <NextBestAction
            title={action.title}
            minutes={action.minutes}
            priority={action.priority}
            impact={impact}
            rationale={action.rationale}
            isStarting={updateTask.isPending}
            onStart={() => {
              if (action.taskId) {
                updateTask.mutate({ taskId: action.taskId, status: "in_progress" });
              }
            }}
          />
        </div>
        <div className="space-y-6">
          <ExecutionGraph
            missionTitle={mission.title}
            milestones={upcoming_milestones}
            tasks={data.todays_tasks}
          />
          <AiActivityFeed events={activity} />
        </div>
      </div>

      <ExecutionTimeline
        milestones={upcoming_milestones}
        tasks={data.todays_tasks}
        onTaskComplete={handleCompleteTask}
        onTaskStart={handleStartTask}
        onTaskSkip={(taskId) => {
          void updateTask.mutate({ taskId, status: "skipped" });
        }}
        onTaskReschedule={(taskId) => {
          console.log("Reschedule task:", taskId);
        }}
        onTaskEdit={(taskId) => {
          console.log("Edit task:", taskId);
        }}
        onTaskDelete={(taskId) => {
          if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            void deleteTask.mutate(taskId);
          }
        }}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Progress & Analytics</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ConfidenceIntel
              score={data.confidence_score}
              trend={data.confidence_trend}
              reasons={buildConfidenceReasons(data)}
            />
            <RiskIntel
              riskLevel={data.risk_level}
              score={data.deadline_risk_score}
              daysRemaining={progress.days_remaining}
              deadline={mission.deadline}
              causes={risk.causes}
              topMitigation={risk.topMitigation}
            />
          </div>
          <div className="space-y-6">
            <ProgressStory
              confidenceScore={data.confidence_score}
              completionRate={progress.completion_rate}
              riskScore={data.deadline_risk_score}
              daysRemaining={progress.days_remaining}
              weeklyScores={weekly?.confidence_scores}
            />
            <ConfidenceSimulator
              baseScore={data.confidence_score}
              currentHours={hoursPerDay(mission)}
              daysRemaining={progress.days_remaining}
              completionRate={progress.completion_rate}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReflectionChat
          reflections={recent_reflections}
          isSubmitting={createReflection.isPending}
          onSubmit={async (values) => {
            await createReflection.mutateAsync(values);
          }}
        />
        <MissionReplay events={replay} />
      </div>
    </motion.div>
  );
}
