import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchExercises,
  fetchExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  type FetchExercisesParams,
  type ExerciseFormData,
} from "./exercisesApi";

// Query Keys
export const exercisesKeys = {
  all: ["exercises"] as const,
  lists: () => [...exercisesKeys.all, "list"] as const,
  list: (filters: FetchExercisesParams) =>
    [...exercisesKeys.lists(), filters] as const,
  details: () => [...exercisesKeys.all, "detail"] as const,
  detail: (id: string) => [...exercisesKeys.details(), id] as const,
};

/**
 * Hook to fetch exercises list with pagination and filtering
 * Endpoint: GET /api/v1/exercises
 */
export const useExercises = (
  params: FetchExercisesParams = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: exercisesKeys.list(params),
    queryFn: () => fetchExercises(params),
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook to fetch a single exercise by ID
 * Endpoint: GET /api/v1/exercises/{id}
 */
export const useExercise = (
  exerciseId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: exercisesKeys.detail(exerciseId),
    queryFn: () => fetchExercise(exerciseId),
    enabled: options?.enabled ?? !!exerciseId,
  });
};

/**
 * Hook to create a new exercise
 * Endpoint: POST /api/v1/exercises (multipart/form-data)
 */
export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      imageFile,
    }: {
      data: ExerciseFormData;
      imageFile?: File;
    }) => createExercise(data, imageFile),
    onSuccess: () => {
      // Invalidate exercises list queries to refetch
      queryClient.invalidateQueries({ queryKey: exercisesKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing exercise
 * Endpoint: PUT /api/v1/exercises/{id} (multipart/form-data)
 */
export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exerciseId,
      data,
      imageFile,
    }: {
      exerciseId: string;
      data: ExerciseFormData;
      imageFile?: File;
    }) => updateExercise(exerciseId, data, imageFile),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: exercisesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: exercisesKeys.detail(variables.exerciseId),
      });
    },
  });
};

/**
 * Hook to delete an exercise
 * Endpoint: DELETE /api/v1/exercises/{id}
 */
export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) => deleteExercise(exerciseId),
    onSuccess: () => {
      // Invalidate exercises list queries
      queryClient.invalidateQueries({ queryKey: exercisesKeys.lists() });
    },
  });
};

