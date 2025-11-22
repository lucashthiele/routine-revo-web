import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ForgotPasswordData } from "../types";
import { AxiosError } from "axios";
import api from "../../../api/axios";

interface ApiError {
  error?: string;
  message?: string;
}

async function forgotPassword(data: ForgotPasswordData): Promise<void> {
  await api.post("/api/v1/password-reset/request", data);
}

export default function useForgotPassword() {
  return useMutation<void, AxiosError<ApiError>, ForgotPasswordData>({
    mutationFn: forgotPassword,
    onSuccess: () => {
      console.log("Password reset email request sent successfully");
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
