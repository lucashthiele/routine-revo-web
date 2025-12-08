import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUser,
  fetchUsers,
  fetchExercises,
  createRoutine,
  associateRoutineWithMember,
  fetchMemberReport,
  updateUser,
  deleteUser,
  createUser,
  fetchRoutines,
  fetchRoutine,
  updateRoutine,
  deleteRoutine,
  bulkAssignRoutines,
  bulkDeleteRoutines,
  bulkSyncRoutines,
  type CreateRoutineRequest,
  type UpdateRoutineRequest,
  type BulkAssignRoutinesRequest,
  type BulkDeleteRoutinesRequest,
  type BulkSyncRoutinesRequest,
} from "./clientsApi";

// Query Keys
export const clientsKeys = {
  all: ["clients"] as const,
  lists: () => [...clientsKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...clientsKeys.lists(), filters] as const,
  details: () => [...clientsKeys.all, "detail"] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
};

export const exercisesKeys = {
  all: ["exercises"] as const,
  lists: () => [...exercisesKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...exercisesKeys.lists(), filters] as const,
};

export const reportsKeys = {
  all: ["reports"] as const,
  member: (memberId: string) =>
    [...reportsKeys.all, "member", memberId] as const,
};

export const routinesKeys = {
  all: ["routines"] as const,
  lists: () => [...routinesKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...routinesKeys.lists(), filters] as const,
};

/**
 * Hook to fetch a single user by ID
 */
export const useUser = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: clientsKeys.detail(userId),
    queryFn: () => fetchUser(userId),
    enabled: options?.enabled ?? !!userId,
  });
};

/**
 * Hook to fetch users/members list
 */
export const useUsers = (
  params: {
    name?: string;
    role?: "ADMIN" | "COACH" | "MEMBER";
    status?: "PENDING" | "ACTIVE" | "INACTIVE";
    coachId?: string;
    page?: number;
    size?: number;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: clientsKeys.list(params),
    queryFn: () => fetchUsers(params),
    enabled: options?.enabled ?? true,
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
      // Invalidate routine and client queries
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
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
    mutationFn: ({
      routineId,
      memberId,
    }: {
      routineId: string;
      memberId: string;
    }) => associateRoutineWithMember(routineId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
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
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { name: string; email: string };
    }) => updateUser(userId, data),
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
    mutationFn: (data: {
      name: string;
      email: string;
      role: "ADMIN" | "COACH" | "MEMBER";
      coachId?: string;
    }) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to fetch routines list
 * Note: staleTime and gcTime are set to 0 to always fetch fresh data (MVP requirement)
 */
export const useRoutines = (
  params: {
    creatorId?: string;
    memberId?: string;
    isExpired?: boolean;
    routineType?: "TEMPLATE" | "CUSTOM";
    page?: number;
    size?: number;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: routinesKeys.list(params),
    queryFn: () => fetchRoutines(params),
    enabled: options?.enabled ?? true,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data
  });
};

/**
 * Hook to bulk assign routines to a member
 */
export const useBulkAssignRoutines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: BulkAssignRoutinesRequest;
    }) => bulkAssignRoutines(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
    },
  });
};

/**
 * Hook to fetch a single routine by ID
 */
export const useRoutine = (
  routineId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...routinesKeys.all, "detail", routineId] as const,
    queryFn: () => fetchRoutine(routineId),
    enabled: options?.enabled ?? !!routineId,
  });
};

/**
 * Hook to update a routine
 */
export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      data,
    }: {
      routineId: string;
      data: UpdateRoutineRequest;
    }) => updateRoutine(routineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to delete a routine
 */
export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routineId: string) => deleteRoutine(routineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
    },
  });
};

/**
 * Hook to bulk delete routines from a member
 */
export const useBulkDeleteRoutines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: BulkDeleteRoutinesRequest;
    }) => bulkDeleteRoutines(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};

/**
 * Hook to bulk sync routines for a member (incremental comparison)
 * Uses PUT /api/v1/users/members/{memberId}/routines/bulk
 * 
 * This syncs the member's routines to match the provided list:
 * - Adds new routines not currently assigned
 * - Removes routines no longer in the list
 * - Leaves unchanged routines as-is
 */
export const useBulkSyncRoutines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: BulkSyncRoutinesRequest;
    }) => bulkSyncRoutines(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routinesKeys.all });
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
};
