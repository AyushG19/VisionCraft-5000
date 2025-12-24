"use client";
import React, { useState } from "react";
import {
  IconMail as Mail,
  IconLock as Lock,
  IconUser as User,
  IconArrowRight as ArrowRight,
  IconBrandGithub as Github,
  IconBrandTwitter as Twitter,
  IconCircleCheck as CheckCircle2,
} from "@tabler/icons-react";
import { AuthMode } from "./types";
import Input from "./ui/input";
import { Button } from "../button";
import {
  LoginFormValues,
  loginResponse,
  SignupFormValues,
  SignupResponse,
} from "@repo/common/types";
import { useRouter } from "next/navigation";

type AuthFormPops = {
  loginHelper: (params: LoginFormValues) => Promise<loginResponse | undefined>;
  signUpHelper: (
    params: SignupFormValues
  ) => Promise<SignupResponse | undefined>;
};

const AuthForm: React.FC<AuthFormPops> = ({ loginHelper, signUpHelper }) => {
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation State (Simulated)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const toggleMode = () => {
    setAuthMode((prev) =>
      prev === AuthMode.LOGIN ? AuthMode.SIGNUP : AuthMode.LOGIN
    );
    setErrors({});
    setSuccessMessage(null);
    // Reset fields optional based on UX preference, keeping them for now usually annoys users less
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (authMode === AuthMode.SIGNUP && !name.trim())
      newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (authMode === AuthMode.SIGNUP && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      setSuccessMessage(null);
      if (authMode === "LOGIN") {
        const res = await loginHelper({ email, password });
        if (!res) return;
      } else if (authMode === "SIGNUP") {
        const res = await signUpHelper({
          name,
          email,
          password,
          confirmPassword,
          terms: true, //hardcoded for temp show
        });
        if (!res) return;
      }
    } catch (error) {
    } finally {
      router.push("/canvas");
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(
        authMode === AuthMode.LOGIN
          ? "Welcome back!"
          : "Account created successfully!"
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-700"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-4 z-10">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative top shimmer */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-indigo-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              {authMode === AuthMode.LOGIN ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-slate-400 text-sm">
              {authMode === AuthMode.LOGIN
                ? "Enter your credentials to access your account"
                : "Join us today and start your journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
            {authMode === AuthMode.SIGNUP && (
              <Input
                id="name"
                label="Full Name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User size={18} />}
                error={errors.name}
              />
            )}

            <Input
              id="email"
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              error={errors.email}
            />

            <Input
              id="password"
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              error={errors.password}
            />

            {authMode === AuthMode.SIGNUP && (
              <Input
                id="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={18} />}
                error={errors.confirmPassword}
              />
            )}

            {authMode === AuthMode.LOGIN && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Button type="submit" className="mt-2 bg-purple-500">
              {authMode === AuthMode.LOGIN ? "Sign In" : "Sign Up"}{" "}
              <ArrowRight size={18} className="ml-2 inline-block" />
            </Button>

            {successMessage && (
              <div className="flex items-center justify-center p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm animate-fade-in">
                <CheckCircle2 size={16} className="mr-2" />
                {successMessage}
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900/60 px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline">
                <Github size={18} />
                Github
              </Button>
              <Button type="button" variant="outline">
                <Twitter size={18} />
                Twitter
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400">
              {authMode === AuthMode.LOGIN
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {authMode === AuthMode.LOGIN ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
