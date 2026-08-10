import { hasFullMobileAccess } from "@/state/authStore";
import { EmailVerificationScreen } from "@/screens/EmailVerificationScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { ContentLibraryScreen } from "@/screens/ContentLibraryScreen";

export function AppNavigator() {
  if (!hasFullMobileAccess()) {
    return <EmailVerificationScreen />;
  }

  return <ContentLibraryScreen />;
}
