import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import Logo from "../../../components/Logo";
import {
  useValidateOnboardingToken,
  useActivateAccount,
} from "../api/useOnboardingApi";
import { activateAccountSchema, type ActivateAccountData } from "../types";

export function OnboardingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const {
    data: tokenData,
    isLoading: isValidating,
    isError: isTokenInvalid,
    error: tokenError,
  } = useValidateOnboardingToken(token);

  const activateAccountMutation = useActivateAccount();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivateAccountData>({
    resolver: zodResolver(activateAccountSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Máximo 72 caracteres", met: password.length <= 72 },
  ];

  // Determine user type from token validation response
  const isMemberOnly = tokenData?.isMember && !tokenData?.isCoach && !tokenData?.isAdmin;
  const isAdminOrCoach = tokenData?.isAdmin || tokenData?.isCoach;

  const onSubmit = async (data: ActivateAccountData) => {
    if (!token) return;

    try {
      await activateAccountMutation.mutateAsync({
        token,
        data: { password: data.password },
      });
      setIsActivated(true);
    } catch {
      // Error handled by mutation
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <Logo />
            </div>
            <h1 className="text-[#333333] mb-2">Routine Revo</h1>
            <p className="text-[#333333]/70">Ativação de Conta</p>
          </div>

          <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-[#333333] mb-2">Link Inválido</h2>
              <p className="text-sm text-[#333333]/70 mb-6">
                O link de ativação não contém um token válido. Verifique se você
                copiou o link corretamente do e-mail recebido.
              </p>
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-[#333333] hover:bg-[#333333]/90 text-white"
              >
                Ir para Login
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-[#333333]/50 mt-8">
            © 2025 Routine Revo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  // Validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <Logo />
            </div>
            <h1 className="text-[#333333] mb-2">Routine Revo</h1>
            <p className="text-[#333333]/70">Ativação de Conta</p>
          </div>

          <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#FA1768]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-[#FA1768] animate-spin" />
              </div>
              <h2 className="text-[#333333] mb-2">Validando Token</h2>
              <p className="text-sm text-[#333333]/70">
                Por favor, aguarde enquanto verificamos seu link de ativação...
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#333333]/50 mt-8">
            © 2025 Routine Revo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  // Token invalid or expired
  if (isTokenInvalid) {
    const statusCode = tokenError?.response?.status;
    let errorMessage = "Token inválido ou expirado";

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      errorMessage =
        tokenError?.response?.data?.message ||
        tokenError?.response?.data?.error ||
        "Token inválido ou expirado";
    } else if (!tokenError?.response) {
      errorMessage = "Não foi possível conectar ao servidor. Tente novamente mais tarde.";
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <Logo />
            </div>
            <h1 className="text-[#333333] mb-2">Routine Revo</h1>
            <p className="text-[#333333]/70">Ativação de Conta</p>
          </div>

          <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-[#333333] mb-2">Token Inválido</h2>
              <p className="text-sm text-[#333333]/70 mb-6">{errorMessage}</p>

              <Alert className="border-[#E6B949]/20 bg-[#E6B949]/5 mb-6 text-left">
                <AlertDescription className="text-sm text-[#333333]/70">
                  Se você acredita que isso é um erro, entre em contato com o
                  administrador para solicitar um novo link de ativação.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleGoToLogin}
                className="w-full bg-[#333333] hover:bg-[#333333]/90 text-white"
              >
                Ir para Login
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-[#333333]/50 mt-8">
            © 2025 Routine Revo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  // Account successfully activated - Member Only (Mobile App User)
  if (isActivated && isMemberOnly) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <Logo />
            </div>
            <h1 className="text-[#333333] mb-2">Routine Revo</h1>
            <p className="text-[#333333]/70">Ativação de Conta</p>
          </div>

          <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-[#333333] mb-2">Conta Ativada!</h2>
              <p className="text-sm text-[#333333]/70 mb-6">
                Sua conta foi ativada com sucesso! Agora você pode acessar o
                aplicativo móvel Routine Revo com sua nova senha.
              </p>

              <Alert className="border-[#FA1768]/20 bg-[#FA1768]/5 mb-6">
                <Smartphone className="w-4 h-4 text-[#FA1768]" />
                <AlertDescription className="text-sm text-[#333333]/70">
                  Baixe o aplicativo Routine Revo na App Store ou Google Play
                  para começar seus treinos!
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                  onClick={() => window.open("https://apps.apple.com", "_blank")}
                >
                  App Store
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                  onClick={() => window.open("https://play.google.com", "_blank")}
                >
                  Google Play
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#333333]/50 mt-8">
            © 2025 Routine Revo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  // Account successfully activated - Admin or Coach (Web Portal User)
  if (isActivated && isAdminOrCoach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <Logo />
            </div>
            <h1 className="text-[#333333] mb-2">Routine Revo</h1>
            <p className="text-[#333333]/70">Ativação de Conta</p>
          </div>

          <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-[#333333] mb-2">Conta Ativada!</h2>
              <p className="text-sm text-[#333333]/70 mb-6">
                Sua conta foi ativada com sucesso. Agora você pode fazer login
                com sua nova senha para acessar o portal.
              </p>

              <Button
                onClick={handleGoToLogin}
                className="w-full bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
              >
                Ir para Login
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-[#333333]/50 mt-8">
            © 2025 Routine Revo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  // Main form - token is valid
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <Logo />
          </div>
          <h1 className="text-[#333333] mb-2">Routine Revo</h1>
          <p className="text-[#333333]/70">Ativação de Conta</p>
        </div>

        <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#FA1768]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6 text-[#FA1768]" />
              </div>
              <h2 className="text-[#333333] mb-2">Crie sua Senha</h2>
              <p className="text-sm text-[#333333]/70">
                Defina uma senha segura para acessar sua conta no sistema
                Routine Revo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#333333]">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768] pr-10"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333]/50 hover:text-[#333333] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}

              {/* Password requirements */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? "text-green-600" : "text-[#333333]/50"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#333333]">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768] pr-10"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333]/50 hover:text-[#333333] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={activateAccountMutation.isPending}
              className="w-full bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
            >
              {activateAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Ativando...
                </>
              ) : (
                "Ativar Conta"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#333333]/50 mt-8">
          © 2025 Routine Revo. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
