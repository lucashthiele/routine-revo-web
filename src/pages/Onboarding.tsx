import { OnboardingForm } from "../features/onboarding/components/OnboardingForm";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function OnboardingPage() {
  useDocumentTitle("Ativar Conta");

  return <OnboardingForm />;
}

