import axios from "axios";
import z from "zod";
import type {
  ValidateTokenResponse,
  ActivateAccountPayload,
} from "../types";

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
});

const env = envSchema.safeParse(import.meta.env);

if (!env.success) {
  console.error("Invalid environment variables:", z.treeifyError(env.error));
  throw new Error("Invalid environment variables");
}

const API_URL = env.data.VITE_API_BASE_URL;

/**
 * Creates an axios instance for onboarding requests
 * This is separate from the main api instance because onboarding
 * uses a different token (onboarding_token) than the auth token
 */
function createOnboardingApi(token: string) {
  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function validateOnboardingToken(
  token: string
): Promise<ValidateTokenResponse> {
  try {
    const api = createOnboardingApi(token);
    const response = await api.post("/api/v1/onboarding/validate-onboarding");
    return response.data;
  } catch (error) {
    // Re-throw with a better message for network errors
    throw error;
  }
}

export async function activateAccount(
  token: string,
  data: ActivateAccountPayload
): Promise<void> {
  const api = createOnboardingApi(token);
  await api.post("/api/v1/onboarding/activate-account", data);
}

