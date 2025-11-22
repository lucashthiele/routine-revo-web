import z from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export interface AuthResponse {
  authToken: string;
  refreshToken: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "COACH";
  };
}
