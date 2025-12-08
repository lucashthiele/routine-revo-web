// Exercise feature types - Aligned with API Documentation

/**
 * MuscleGroup enum - matches backend enum exactly
 * Server values: CHEST | BACK | SHOULDERS | BICEPS | TRICEPS | LEGS | GLUTES | ABS | CARDIO | FULL_BODY
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
 * All muscle group values for iteration
 */
export const MUSCLE_GROUPS: MuscleGroup[] = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "LEGS",
  "GLUTES",
  "ABS",
  "CARDIO",
  "FULL_BODY",
];

/**
 * Map MuscleGroup enum to display names (Portuguese)
 */
export const muscleGroupDisplayNames: Record<MuscleGroup, string> = {
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
 * Map display names to MuscleGroup enum (for form submission)
 */
export const displayNameToMuscleGroup: Record<string, MuscleGroup> = {
  Peito: "CHEST",
  Costas: "BACK",
  Ombros: "SHOULDERS",
  Bíceps: "BICEPS",
  Tríceps: "TRICEPS",
  Pernas: "LEGS",
  Glúteos: "GLUTES",
  Abdômen: "ABS",
  Cardio: "CARDIO",
  "Corpo Inteiro": "FULL_BODY",
};

/**
 * Get display name for a muscle group
 */
export function getMuscleGroupDisplayName(muscleGroup: MuscleGroup): string {
  return muscleGroupDisplayNames[muscleGroup] || muscleGroup;
}

/**
 * Equipment options - for UI display in forms
 */
export const EQUIPMENT_OPTIONS = [
  "Barra",
  "Halteres",
  "Máquina",
  "Cabo",
  "Peso Corporal",
  "Kettlebell",
  "Elástico",
  "TRX",
  "Medicine Ball",
  "Banco",
  "Outro",
] as const;

export type Equipment = (typeof EQUIPMENT_OPTIONS)[number];
