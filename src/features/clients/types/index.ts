// Client Management Types

export interface Client {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  currentRoutine: string;
  lastWorkout: string;
  adherenceRate: number;
  trainingDaysPerWeek?: number;
  assignedRoutines?: AssignedRoutine[];
}

export interface AssignedRoutine {
  routineId: string;
  name: string;
  expirationDate?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: number;
  duration: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  exerciseList: Exercise[];
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  muscleGroup: string;
}

