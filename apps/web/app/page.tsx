"use client";
import { AuthForm } from "@repo/ui";
import { loginService, signupService } from "./services";
export default function Home() {
  return (
    <AuthForm
      signUpHelper={signupService}
      loginHelper={loginService}
    ></AuthForm>
  );
}
