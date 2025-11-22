import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import Logo from "../../../components/Logo";
import useForgotPassword from "../api/useForgotPassword";
import { forgotPasswordSchema, type ForgotPasswordData } from "../types";

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Failed to send password reset email:", error);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <Logo />
          </div>
          <h1 className="text-[#333333] mb-2">Routine Revo</h1>
          <p className="text-[#333333]/70">Recuperação de Senha</p>
        </div>

        <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#FA1768]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-[#FA1768]" />
                </div>
                <h2 className="text-[#333333] mb-2">Esqueceu sua senha?</h2>
                <p className="text-sm text-[#333333]/70">
                  Informe seu endereço de e-mail e enviaremos instruções para
                  redefinir sua senha.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#333333]">
                  Endereço de E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@routinerevo.com"
                  {...register("email")}
                  className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
              >
                {forgotPasswordMutation.isPending
                  ? "Enviando..."
                  : "Enviar Link de Recuperação"}
              </Button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-sm text-[#333333]/70 hover:text-[#333333] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Login
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#E6B949]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-[#E6B949]" />
                </div>
                <h2 className="text-[#333333] mb-2">E-mail Enviado!</h2>
                <p className="text-sm text-[#333333]/70 mb-6">
                  Se o endereço{" "}
                  <span className="font-medium text-[#333333]">
                    {submittedEmail}
                  </span>{" "}
                  estiver cadastrado em nosso sistema, você receberá um e-mail
                  com instruções para redefinir sua senha.
                </p>
              </div>

              <Alert className="border-[#E6B949]/20 bg-[#E6B949]/5">
                <AlertDescription className="text-sm text-[#333333]/70">
                  Não recebeu o e-mail? Verifique sua caixa de spam ou tente
                  novamente em alguns minutos.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleBackToLogin}
                className="w-full bg-[#333333] hover:bg-[#333333]/90 text-white"
              >
                Voltar para Login
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#333333]/50 mt-8">
          © 2025 Routine Revo. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
