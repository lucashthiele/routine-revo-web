import z from "zod";

export const activateAccountSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .max(72, "A senha deve ter no máximo 72 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ActivateAccountData = z.infer<typeof activateAccountSchema>;

export interface ValidateTokenResponse {
  isMember: boolean;
  isCoach: boolean;
  isAdmin: boolean;
}

export interface ActivateAccountPayload {
  password: string;
}

