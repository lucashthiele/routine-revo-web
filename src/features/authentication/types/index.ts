import z from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

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
