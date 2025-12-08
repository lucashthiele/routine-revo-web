/**
 * Re-export routine-related API hooks and functions from the clients API module
 * This provides a clean import path for the routines feature
 */
export {
  // Hooks
  useRoutines,
  useRoutine,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
  useExercises,
  // Keys for cache invalidation
  routinesKeys,
  exercisesKeys,
} from "../../clients/api/useClientsApi";

export {
  // Types
  type RoutineResponse,
  type RoutinesListResponse,
  type RoutineItemResponse,
  type RoutineItemRequest,
  type CreateRoutineRequest,
  type UpdateRoutineRequest,
  type ExerciseResponse,
  type ExercisesListResponse,
  // API functions (for direct use if needed)
  fetchRoutines,
  fetchRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  fetchExercises,
} from "../../clients/api/clientsApi";

