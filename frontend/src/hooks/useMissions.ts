import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/authStore";
import { missionsApi, tasksApi } from "@/lib/api";
import type { MissionCreate, ReflectionCreate, TaskStatus } from "@/types/api";

function useToken() {
  const token = useAuthStore((s) => s.token);
  if (!token) throw new Error("Not authenticated");
  return token;
}

export function useMissions() {
  const token = useToken();
  return useQuery({
    queryKey: ["missions"],
    queryFn: () => missionsApi.list(token),
  });
}

export function useMission(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId],
    queryFn: () => missionsApi.get(token, missionId),
    enabled: Boolean(missionId),
  });
}

export function useMissionDashboard(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId, "dashboard"],
    queryFn: () => missionsApi.dashboard(token, missionId),
    enabled: Boolean(missionId),
  });
}

export function useCoachMessage(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId, "coach"],
    queryFn: () => missionsApi.coachMessage(token, missionId),
    enabled: Boolean(missionId),
  });
}

export function useWeeklyInsights(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId, "weekly-insights"],
    queryFn: () => missionsApi.weeklyInsights(token, missionId),
    enabled: Boolean(missionId),
  });
}

export function useCreateMission() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MissionCreate) => missionsApi.create(token, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

export function useUpdateTaskStatus(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.updateStatus(token, taskId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
    },
  });
}

export function useCreateReflection(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReflectionCreate) =>
      missionsApi.createReflection(token, missionId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "coach"] });
    },
  });
}

export function useRecoveryPlan(missionId: string) {
  const token = useToken();
  return useMutation({
    mutationFn: () => missionsApi.recoveryPlan(token, missionId),
  });
}

export function useApplyRecoveryPlan(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => missionsApi.applyRecoveryPlan(token, missionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
    },
  });
}
