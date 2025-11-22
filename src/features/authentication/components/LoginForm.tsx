import { useForm } from "react-hook-form";
import useLogin from "../api/useLogin";
import { type LoginCredentials, loginSchema } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginCredentials, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    login(data);
  };

  // TODO - Contact Administrator
  const handleContactAdmin = () => {
    alert("Entre em contato com o administrador");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#333333]">
          Endereço de E-mail
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#333333]">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-[#333333]/70 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-[#333333]/20 text-[#FA1768] focus:ring-[#FA1768]"
          />
          Lembrar-me
        </label>
        <Link
          to="/forgot-password"
          className="text-[#FA1768] hover:text-[#FA1768]/90 transition-colors"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </Button>

      <div className="text-center text-sm text-[#333333]/70">
        Precisa de acesso?{" "}
        <button
          type="button"
          onClick={handleContactAdmin}
          className="text-[#FA1768] hover:text-[#FA1768]"
        >
          Contatar Administrador
        </button>
      </div>
    </form>
  );
}
