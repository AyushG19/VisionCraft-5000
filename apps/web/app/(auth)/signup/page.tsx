"use client";
import { LoginForm } from "@workspace/ui/components/login-form";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  function handleGithubLogin() {
    signIn("github");
  }
  return (
    <div className="bg-black flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm id="signup" />
      </div>
    </div>
  );
}
