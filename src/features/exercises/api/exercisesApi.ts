import api from "../../../api/axios";
import type { MuscleGroup } from "../types";

// Response types based on API documentation

export interface ExerciseResponse {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  equipment?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExercisesListResponse {
  exercises: ExerciseResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ExerciseCreateResponse {
  id: string;
  message: string;
}

// Request types

export interface ExerciseFormData {
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  equipment?: string;
}

export interface FetchExercisesParams {
  name?: string;
  muscleGroup?: MuscleGroup;
  page?: number;
  size?: number;
}

// API Functions

/**
 * Fetch exercises with pagination and filtering
 * GET /api/v1/exercises
 *
 * Query params:
 * - name: string (partial match)
 * - muscleGroup: MuscleGroup enum
 * - page: number (0-indexed)
 * - size: number (default 10)
 */
export const fetchExercises = async (
  params: FetchExercisesParams
): Promise<ExercisesListResponse> => {
  const response = await api.get<ExercisesListResponse>("/api/v1/exercises", {
    params,
  });
  return response.data;
};

/**
 * Fetch a single exercise by ID
 * GET /api/v1/exercises/{id}
 */
export const fetchExercise = async (
  exerciseId: string
): Promise<ExerciseResponse> => {
  const response = await api.get<ExerciseResponse>(
    `/api/v1/exercises/${exerciseId}`
  );
  return response.data;
};

/**
 * Create a new exercise (multipart/form-data)
 * POST /api/v1/exercises
 *
 * Form data:
 * - data: JSON string with { name, muscleGroup, description?, equipment? }
 * - file: Image file (optional)
 */
export const createExercise = async (
  data: ExerciseFormData,
  imageFile?: File
): Promise<ExerciseCreateResponse> => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  if (imageFile) {
    formData.append("file", imageFile);
  }

  const response = await api.post<ExerciseCreateResponse>(
    "/api/v1/exercises",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Update an existing exercise (multipart/form-data)
 * PUT /api/v1/exercises/{id}
 *
 * Form data:
 * - data: JSON string with { name, muscleGroup, description?, equipment? }
 * - file: New image file (optional)
 */
export const updateExercise = async (
  exerciseId: string,
  data: ExerciseFormData,
  imageFile?: File
): Promise<ExerciseResponse> => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  if (imageFile) {
    formData.append("file", imageFile);
  }

  const response = await api.put<ExerciseResponse>(
    `/api/v1/exercises/${exerciseId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Delete an exercise
 * DELETE /api/v1/exercises/{id}
 */
export const deleteExercise = async (exerciseId: string): Promise<void> => {
  await api.delete(`/api/v1/exercises/${exerciseId}`);
};



