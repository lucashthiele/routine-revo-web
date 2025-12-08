import { ForgotPasswordForm } from "../features/authentication/components/ForgotPasswordForm";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ForgotPasswordPage() {
  useDocumentTitle("Recuperar Senha");

  return <ForgotPasswordForm />;
}

