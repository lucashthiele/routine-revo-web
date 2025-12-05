import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsers,
  fetchExercises,
  createRoutine,
  associateRoutineWithMember,
  fetchMemberReport,
  updateUser,
  deleteUser,
  createUser,
  fetchRoutines,
  bulkAssignRoutines,
  type CreateRoutineRequest,
  type BulkAssignRoutinesRequest,
} from "./clientsApi";

// Query Keys
export const clientsKeys = {
  all: ["clients"] as const,
  lists: () => [...clientsKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...clientsKeys.lists(), filters] as const,
  details: () => [...clientsKeys.all, "detail"] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
};

export const exercisesKeys = {
  all: ["exercises"] as const,
  lists: () => [...exercisesKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...exercisesKeys.lists(), filters] as const,
};

export const reportsKeys = {
  all: ["reports"] as const,
  member: (memberId: string) => [...reportsKeys.all, "member", memberId] as const,
};

export const routinesKeys = {
  all: ["routines"] as const,
  lists: () => [...routinesKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...routinesKeys.lists(), filters] as const,
};

/**
 * Hook to fetch users/members list
 */
export const useUsers = (params: {
  name?: string;
  role?: "ADMIN" | "COACH" | "MEMBER";
  status?: "PENDING" | "ACTIVE" | "INACTIVE";
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: clientsKeys.list(params),
    queryFn: () => fetchUsers(params),
  });
};

/**
 * Hook to fetch exercises library
 */
export const useExercises = (params: {
  name?: string;
  muscleGroup?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: exercisesKeys.list(params),
    queryFn: () => fetchExercises(params),
  });
};

/**
 * Hook to fetch member report
 */
export const useMemberReport = (memberId: string) => {
  return useQuery({
    queryKey: reportsKeys.member(memberId),
    queryFn: () => fetchMemberReport(memberId),
    enabled: !!memberId,
  });
};

/**
 * Hook to create a new routine
 */
export const useCreateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoutineRequest) => createRoutine(data),
    onSuccess: () => {
      // Invalidate any routine-related queries if needed
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to associate routine with member
 */
export const useAssociateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routineId, memberId }: { routineId: string; memberId: string }) =>
      associateRoutineWithMember(routineId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to update user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { name: string; email: string } }) =>
      updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to delete/inactivate user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string; role: "ADMIN" | "COACH" | "MEMBER"; coachId?: string }) =>
      createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to fetch routines list
 */
export const useRoutines = (params: {
  creatorId?: string;
  memberId?: string;
  isExpired?: boolean;
  templatesOnly?: boolean;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: routinesKeys.list(params),
    queryFn: () => fetchRoutines(params),
  });
};

/**
 * Hook to bulk assign routines to a member
 */
export const useBulkAssignRoutines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: BulkAssignRoutinesRequest }) =>
      bulkAssignRoutines(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
    },
  });
};

