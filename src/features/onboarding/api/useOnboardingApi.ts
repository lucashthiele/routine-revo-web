import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { validateOnboardingToken, activateAccount } from "./onboardingApi";
import type { ValidateTokenResponse, ActivateAccountPayload } from "../types";

interface ApiError {
  error?: string;
  message?: string;
}

export function useValidateOnboardingToken(token: string | null) {
  return useQuery<ValidateTokenResponse, AxiosError<ApiError>>({
    queryKey: ["onboarding", "validate", token],
    queryFn: () => {
      if (!token) {
        throw new Error("Token não fornecido");
      }
      return validateOnboardingToken(token);
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}

export function useActivateAccount() {
  return useMutation<
    void,
    AxiosError<ApiError>,
    { token: string; data: ActivateAccountPayload }
  >({
    mutationFn: ({ token, data }) => activateAccount(token, data),
    onSuccess: () => {
      toast.success("Conta ativada com sucesso! Faça login com sua nova senha.");
    },
    onError: (err) => {
      const statusCode = err.response?.status;

      if (statusCode && statusCode >= 400 && statusCode < 500) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Token inválido ou expirado";
        toast.error(errorMessage);
      } else {
        toast.error("Ocorreu um erro inesperado. Tente novamente mais tarde.");
      }
    },
  });
}

