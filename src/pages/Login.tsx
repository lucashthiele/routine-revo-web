import LoginForm from "../features/authentication/components/LoginForm";
import Logo from "../components/Logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <Logo />
          </div>
          <h1 className="text-[#333333] mb-2">Routine Revo</h1>
          <p className="text-[#333333]/70">Portal do Administrador & Treinador</p>
        </div>

        <div className="bg-white border border-[#333333]/10 rounded-lg p-8 shadow-sm">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-[#333333]/50 mt-8">
          © 2025 Routine Revo. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
