import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../api/axios";
import { useAuth } from "../../../providers/AuthProvider";
import type { AuthResponse, LoginCredentials } from "../types";
import { AxiosError } from "axios";

interface ApiError {
  error?: string;
  message?: string;
}

async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/api/v1/auth/login",
    credentials
  );
  return data;
}

export default function useLogin() {
  const { login } = useAuth();

  return useMutation<AuthResponse, AxiosError<ApiError>, LoginCredentials>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login successful, redirecting...", data);
      const auth = {
        token: data.authToken,
        refreshToken: data.refreshToken,
      };
      login(auth, data.user);
    },
    onError: (err) => {
      const statusCode = err.response?.status;

      // For 4xx errors, show the specific error message from the API
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Ocorreu um erro inesperado";
        toast.error(errorMessage);
      } else {
        // For 5xx errors or network errors, show generic message
        toast.error("Ocorreu um erro inesperado");
      }
    },
  });
}
