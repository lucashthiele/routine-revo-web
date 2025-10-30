import { useMutation } from "@tanstack/react-query";
import api from "../../../api/axios";
import { useAuth } from "../../../providers/AuthProvider";
import type { AuthResponse, LoginCredentials } from "../types";
import { AxiosError } from "axios";

interface ApiError {
  message: string;
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
      console.error("Login failed:", err.response?.data?.message);
    },
  });
}
