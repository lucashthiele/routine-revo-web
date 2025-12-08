/**
 * Types for the Routines feature
 * These types define the data structures for exercises and workout routines
 */

/**
 * MuscleGroup enum matching backend
 */
export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "LEGS"
  | "GLUTES"
  | "ABS"
  | "CARDIO"
  | "FULL_BODY";

/**
 * Difficulty/Level type union for UI display
 */
export type DifficultyLevel = "Iniciante" | "Intermediário" | "Avançado";

/**
 * Routine type from API
 */
export type RoutineType = "TEMPLATE" | "CUSTOM";

/**
 * Exercise from the exercise library (API response format)
 */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  equipment?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Routine item from API response
 */
export interface RoutineItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseImageUrl?: string;
  sets: number;
  reps: string;
  load?: number;
  restTime?: string;
  sequenceOrder: number;
}

/**
 * Routine item for creating/updating routines (request format)
 */
export interface RoutineItemInput {
  exerciseId: string;
  sets: number;
  reps: string;
  load?: number;
  restTime?: string;
  sequenceOrder: number;
}

/**
 * Saved routine from API
 */
export interface Routine {
  id: string;
  name: string;
  description?: string;
  expirationDate?: string;
  isExpired: boolean;
  creatorId: string;
  memberId?: string;
  routineType: RoutineType;
  templateId?: string;
  itemCount: number;
  items: RoutineItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/editing a routine
 */
export interface RoutineFormData {
  name: string;
  description: string;
  items: RoutineItemInput[];
}

/**
 * Helper to translate muscle group to Portuguese
 */
export const muscleGroupLabels: Record<MuscleGroup, string> = {
  CHEST: "Peito",
  BACK: "Costas",
  SHOULDERS: "Ombros",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  LEGS: "Pernas",
  GLUTES: "Glúteos",
  ABS: "Abdômen",
  CARDIO: "Cardio",
  FULL_BODY: "Corpo Inteiro",
};

/**
 * Get muscle group label in Portuguese
 */
export const getMuscleGroupLabel = (muscleGroup: MuscleGroup): string => {
  return muscleGroupLabels[muscleGroup] || muscleGroup;
};
