import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/authStore";
import { aiProfilesApi, missionsApi, tasksApi } from "@/lib/api";
import type { AIProfileCreate, AIProfileUpdate, MissionCreate, ReflectionCreate, TaskStatus } from "@/types/api";

function useToken() {
  return useAuthStore((s) => s.token);
}

export function useMissions() {
  const token = useToken();
  return useQuery({
    queryKey: ["missions"],
    enabled: Boolean(token),
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.list(token);
    },
  });
}

export function useMission(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId],
    enabled: Boolean(token) && Boolean(missionId),
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.get(token, missionId);
    },
  });
}

export function useMissionDashboard(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId, "dashboard"],
    enabled: Boolean(token) && Boolean(missionId),
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.dashboard(token, missionId);
    },
  });
}

export function useCoachMessage(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId, "coach"],
    enabled: Boolean(token) && Boolean(missionId),
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.coachMessage(token, missionId);
    },
  });
}

export function useWeeklyInsights(missionId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["missions", missionId, "weekly-insights"],
    enabled: Boolean(token) && Boolean(missionId),
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.weeklyInsights(token, missionId);
    },
  });
}

export function useCreateMission() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MissionCreate) => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.create(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

export function useUpdateMission(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MissionCreate>) => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.update(token, missionId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
    },
  });
}

export function useDeleteMission() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (missionId: string) => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.delete(token, missionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

export function useRegenerateMission(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.regenerate(token, missionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
    },
  });
}

export function useUpdateTaskStatus(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      if (!token) throw new Error("Not authenticated");
      return tasksApi.updateStatus(token, taskId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
    },
  });
}

export function useDeleteTask(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => {
      if (!token) throw new Error("Not authenticated");
      return tasksApi.delete(token, taskId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
    },
  });
}

export function useCreateReflection(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReflectionCreate) => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.createReflection(token, missionId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "coach"] });
    },
  });
}

export function useRecoveryPlan(missionId: string) {
  const token = useToken();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.recoveryPlan(token, missionId);
    },
  });
}

export function useApplyRecoveryPlan(missionId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      return missionsApi.applyRecoveryPlan(token, missionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId] });
      void queryClient.invalidateQueries({ queryKey: ["missions", missionId, "dashboard"] });
    },
  });
}

export function useAIProfile() {
  const token = useToken();
  return useQuery({
    queryKey: ["ai-profile"],
    enabled: Boolean(token),
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return aiProfilesApi.get(token);
    },
  });
}

export function useCreateAIProfile() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AIProfileCreate) => {
      if (!token) throw new Error("Not authenticated");
      return aiProfilesApi.create(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ai-profile"] });
    },
  });
}

export function useUpdateAIProfile() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AIProfileUpdate) => {
      if (!token) throw new Error("Not authenticated");
      return aiProfilesApi.update(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ai-profile"] });
    },
  });
}

export function useCompleteOnboarding() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      return aiProfilesApi.completeOnboarding(token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ai-profile"] });
    },
  });
}
