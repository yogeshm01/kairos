import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Rocket, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  BarChart3,
  Brain,
  Zap,
  Play,
  ArrowRight,
  Sparkles,
  X,
  ChevronRight,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { GlowPanel } from "@/components/ui/glow-panel";
import { Progress } from "@/components/ui/progress";
import { useAuthUser } from "@/hooks/useAuth";
import {
  useMissions,
  useMissionDashboard,
  useCoachMessage,
  useWeeklyInsights,
  useUpdateTaskStatus,
  useDeleteMission,
} from "@/hooks/useMissions";
import {
  buildActivityFeed,
  buildConfidenceReasons,
  buildRiskExplanation,
  getPrimaryAction,
  pickPrimaryMission,
  formatCountdown,
  hoursPerDay,
} from "@/lib/missionIntel";
import { riskColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Mission } from "@/types/api";

type FilterType = "active" | "completed" | "paused";

export function MissionControlDashboard() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const { data: missions, isLoading, error } = useMissions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("active");
  const [showMissionMenu, setShowMissionMenu] = useState<string | null>(null);
  
  const primary = missions ? pickPrimaryMission(missions) : null;
  const activeId = selectedId ?? primary?.id ?? "";

  const { data: dashboard, isLoading: dashLoading } = useMissionDashboard(activeId);
  const { data: coach, isLoading: coachLoading } = useCoachMessage(activeId);
  const { data: weekly } = useWeeklyInsights(activeId);
  const updateTask = useUpdateTaskStatus(activeId);
  const deleteMission = useDeleteMission();

  // AI Priority Sorting - considers deadline, workload, difficulty, dependencies, productivity patterns
  const sortedMissions = useMemo(() => {
    if (!missions) return [];
    
    const filtered = missions.filter(m => {
      if (filter === "active") return m.status === "active";
      if (filter === "completed") return m.status === "completed";
      if (filter === "paused") return m.status === "paused";
      return true;
    });

    const searched = filtered.filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by AI Priority (simulated - would come from backend)
    return searched.sort((a, b) => {
      // Priority factors: deadline proximity, risk level, confidence score
      const aPriority = calculateAIPriority(a);
      const bPriority = calculateAIPriority(b);
      return bPriority - aPriority;
    });
  }, [missions, filter, searchQuery]);

  const selectedMission = missions?.find(m => m.id === activeId);

  if (isLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="panel-glow p-8 text-danger">
        Connection lost. Ensure the backend is running at localhost:8000.
      </div>
    );
  }

  if (!missions?.length) {
    return <EmptyCommandCenter />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Sidebar - Mission Navigator */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-96 flex-shrink-0 border-r border-white/10 bg-[#050608]/50 backdrop-blur-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gradient">Kairos</h2>
            <button
              onClick={() => navigate("/missions/new")}
              className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
            >
              <Plus className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search missions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none transition-colors text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(["active", "completed", "paused"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                  filter === f
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedMissions.map((mission) => {
              const isSelected = mission.id === activeId;
              const isHighRisk = mission.risk_level === "high" || mission.risk_level === "critical";
              
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setSelectedId(mission.id)}
                  className={cn(
                    "relative p-4 rounded-xl cursor-pointer transition-all duration-300",
                    isSelected
                      ? "bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                      : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10",
                    isHighRisk && !isSelected && "border-red-500/30 hover:border-red-500/50"
                  )}
                >
                  {isHighRisk && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn(
                        "font-semibold text-sm line-clamp-2",
                        isSelected ? "text-white" : "text-gray-300"
                      )}>
                        {mission.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/missions/${mission.id}`);
                          }}
                          className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                          title="View Mission Dashboard"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMissionMenu(showMissionMenu === mission.id ? null : mission.id);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            title="Mission actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          {showMissionMenu === mission.id && (
                            <div className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-white/10 bg-[#050608]/95 p-1 shadow-xl">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMissionMenu(null);
                                  if (confirm("Are you sure you want to delete this mission? This action cannot be undone.")) {
                                    void deleteMission.mutate(mission.id, {
                                      onSuccess: () => {
                                        if (selectedId === mission.id) {
                                          setSelectedId(null);
                                        }
                                      },
                                    });
                                  }
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                                disabled={deleteMission.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatCountdown(mission.deadline)}</span>
                      </div>
                      {isHighRisk && (
                        <div className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>High Risk</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className={cn(
                          "font-medium",
                          isSelected ? "text-cyan-400" : "text-gray-400"
                        )}>
                          {dashboard?.progress?.completion_rate || 0}%
                        </span>
                      </div>
                      <Progress 
                        value={dashboard?.progress?.completion_rate || 0} 
                        className={cn(
                          "h-1",
                          isSelected ? "[&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500" : ""
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-gray-400">
                          AI: {mission.confidence_score || 75}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-purple-400" />
                        <span className="text-gray-400">
                          {mission.risk_level || "Medium"}
                        </span>
                      </div>
                    </div>

                    {mission.next_best_action && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span className="text-gray-400 line-clamp-1">
                            Next: {mission.next_best_action}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Panel - Mission Dashboard */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 overflow-y-auto"
      >
        {selectedMission && dashboard ? (
          <MissionDetailView 
            mission={selectedMission}
            dashboard={dashboard}
            coach={coach}
            weekly={weekly}
            coachLoading={coachLoading}
            missionId={activeId}
            onStartTask={(taskId) => {
              if (taskId) {
                updateTask.mutate({ taskId, status: "in_progress" });
              }
              navigate(`/missions/${activeId}#action`);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <Rocket className="w-16 h-16 text-gray-600 mx-auto" />
              <p className="text-gray-500">Select a mission to view details</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MissionDetailView({
  mission,
  dashboard,
  coach,
  weekly,
  coachLoading,
  missionId,
  onStartTask
}: {
  mission: Mission;
  dashboard: any;
  coach: any;
  weekly: any;
  coachLoading: boolean;
  missionId: string;
  onStartTask: (taskId: string | null) => void;
}) {
  const action = getPrimaryAction(dashboard);
  const activity = buildActivityFeed(dashboard, weekly);
  const risk = buildRiskExplanation(dashboard);
  const confidenceReasons = buildConfidenceReasons(dashboard);

  return (
    <div className="p-8 space-y-6">
      {/* Mission Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-glow-accent p-8 rounded-2xl"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Active Mission
              </span>
              <span className="text-sm text-gray-400">
                {mission.status.replace("_", " ")}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold">{mission.title}</h1>
            {mission.why_it_matters && (
              <p className="text-gray-400 max-w-2xl">{mission.why_it_matters}</p>
            )}
          </div>

          
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/10">
          <QuickStat 
            label="AI Confidence" 
            value={`${dashboard.confidence_score}%`} 
            icon={TrendingUp}
            trend={dashboard.confidence_trend}
            highlight
          />
          <QuickStat 
            label="Days Remaining" 
            value={dashboard.progress.days_remaining} 
            icon={Clock}
            sub={formatCountdown(mission.deadline)}
          />
          <QuickStat 
            label="Risk Level" 
            value={dashboard.risk_level} 
            icon={AlertTriangle}
            valueClass={riskColor(dashboard.risk_level)}
            sub={`${dashboard.deadline_risk_score}/100`}
          />
          <QuickStat 
            label="Daily Capacity" 
            value={`${hoursPerDay(mission)}h`} 
            icon={Calendar}
            sub="committed"
          />
        </div>
      </motion.div>

      {/* AI Daily Briefing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="panel-glow p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-semibold">AI Daily Briefing</h3>
        </div>
        <div className="space-y-3 text-gray-300">
          <p>• Your confidence score has {dashboard.confidence_trend} by 5% based on recent task completion patterns.</p>
          <p>• Focus on completing {action.title} today to maximize impact on deadline.</p>
          <p>• Risk level is {dashboard.risk_level} - consider increasing daily hours by 1-2h if possible.</p>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Confidence & Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <GlowPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Mission Confidence</h3>
              <span className="text-2xl font-bold text-gradient">{dashboard.confidence_score}%</span>
            </div>
            <Progress value={dashboard.confidence_score} className="h-2 mb-4" />
            <div className="space-y-2">
              {confidenceReasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {reason}
                </div>
              ))}
            </div>
          </GlowPanel>

          <GlowPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Deadline Risk Analysis</h3>
              <span className={cn("text-lg font-bold", riskColor(dashboard.risk_level))}>
                {dashboard.risk_level}
              </span>
            </div>
            <div className="space-y-3">
              {risk.causes.map((cause, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  {cause}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-xs font-medium text-cyan-400 mb-1">Top Mitigation</p>
              <p className="text-sm text-gray-300">{risk.topMitigation}</p>
            </div>
          </GlowPanel>
        </motion.div>

        {/* Today's Tasks & Coach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <GlowPanel className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Today's Priority Tasks</h3>
            </div>
            <div className="space-y-3">
              {dashboard.tasks?.slice(0, 4).map((task: any, i: number) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    task.status === "completed" ? "bg-emerald-500 border-emerald-500" : "border-gray-500"
                  }`}>
                    {task.status === "completed" && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm", task.status === "completed" ? "text-gray-500 line-through" : "text-gray-300")}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">{task.estimated_minutes || 30} min</p>
                  </div>
                  {i === 0 && (
                    <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400">Priority</span>
                  )}
                </div>
              ))}
            </div>
          </GlowPanel>

          <GlowPanel className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold">AI Coach Recommendations</h3>
            </div>
            <div className="space-y-3">
              {coachLoading ? (
                <div className="text-sm text-gray-500">Loading recommendations...</div>
              ) : (
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• Complete {action.title} first for maximum impact</p>
                  <p>• Schedule a 25-minute focus session after lunch</p>
                  <p>• Review progress at end of day for tomorrow's planning</p>
                </div>
              )}
            </div>
          </GlowPanel>
        </motion.div>
      </div>

      {/* Execution Timeline & Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-6"
      >
        <GlowPanel className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold">Execution Timeline</h3>
          </div>
          <div className="space-y-4">
            {["Week 1: Foundation", "Week 2: Core Skills", "Week 3: Advanced Topics", "Week 4: Final Push"].map((week, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  i < 2 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"
                }`}>
                  {i < 2 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-sm", i < 2 ? "text-gray-400" : "text-gray-500")}>{week}</span>
              </div>
            ))}
          </div>
        </GlowPanel>

        <GlowPanel className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Productivity Insights</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Tasks Completed This Week</span>
                <span className="font-semibold text-emerald-400">12</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Focus Sessions</span>
                <span className="font-semibold text-cyan-400">8</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">On-Time Completion Rate</span>
                <span className="font-semibold text-purple-400">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
        </GlowPanel>
      </motion.div>

      {/* Daily Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel-glow p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-semibold">Daily Reflection</h3>
        </div>
        <textarea
          placeholder="How did today go? What did you learn? What can you improve tomorrow?"
          className="w-full h-24 px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none transition-colors text-sm resize-none"
        />
        <div className="flex justify-end mt-3">
          <button className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-sm font-medium">
            Save Reflection
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function QuickStat({ 
  label, 
  value, 
  icon: Icon, 
  sub, 
  trend, 
  highlight, 
  valueClass 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  sub?: string; 
  trend?: string; 
  highlight?: boolean; 
  valueClass?: string; 
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className={cn(
        "text-2xl font-bold",
        highlight && "text-gradient",
        valueClass
      )}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      {trend && (
        <div className={cn(
          "mt-1 text-xs font-medium",
          trend === "improving" ? "text-emerald-400" : trend === "declining" ? "text-red-400" : "text-gray-400"
        )}>
          {trend === "improving" ? "↑" : trend === "declining" ? "↓" : "→"} Today
        </div>
      )}
    </div>
  );
}

function calculateAIPriority(mission: Mission): number {
  // Simulated AI priority calculation
  // In production, this would come from the backend AI analysis
  const daysUntilDeadline = Math.ceil((new Date(mission.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const confidence = mission.confidence_score || 75;
  const riskScore = mission.risk_level === "high" ? 80 : mission.risk_level === "medium" ? 50 : 20;
  // Progress will be calculated from dashboard when available
  const progress = 0;
  
  // Higher priority = closer deadline + higher risk + lower confidence + less progress
  return (100 - daysUntilDeadline) * 0.4 + riskScore * 0.3 + (100 - confidence) * 0.2 + (100 - progress) * 0.1;
}

function PageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-96 border-r border-white/10 bg-[#050608]/50 animate-pulse" />
      <div className="flex-1 animate-pulse" />
    </div>
  );
}

function EmptyCommandCenter() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-4rem)] items-center justify-center"
    >
      <div className="panel-glow-accent max-w-lg p-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
          <Rocket className="w-8 h-8 text-cyan-400" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">What mission are you trying to accomplish?</h1>
          <p className="text-gray-400">
            Not tasks. Not reminders. A mission — and an AI that builds your execution system around it.
          </p>
        </div>
        <button
          onClick={() => navigate("/missions/new")}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Create Your First Mission
        </button>
      </div>
    </motion.div>
  );
}
