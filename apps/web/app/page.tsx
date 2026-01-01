"use client";
import {
  DotsPattern,
  TopSection,
  MainContent,
  BottomSection,
  FloatingShapes,
  DecorativeLines,
} from "@workspace/ui/index";
import { loginService, signupService } from "./services/auth.service";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const navigate = (route: string) => {
    router.push(`/${route}`);
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-easy-bg">
      {/* Decorative dots pattern on the left */}
      <DotsPattern />

      {/* Top section with USERS badge and decorative elements */}
      <TopSection />

      {/* Main content area */}
      <MainContent
        signupService={signupService}
        loginService={loginService}
        navigate={navigate}
      />

      {/* Bottom section with shapes label */}
      <BottomSection />

      {/* Decorative floating shapes */}
      <FloatingShapes />

      {/* Decorative squiggly lines */}
      <DecorativeLines />
    </div>
  );
}
