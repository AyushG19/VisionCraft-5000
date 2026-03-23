"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useState,
} from "react";
import { type AppErrorCodeType } from "@repo/common";

type ErrorContextType = {
  error: { code: AppErrorCodeType; message: string } | null;
  setError: Dispatch<
    React.SetStateAction<{ code: AppErrorCodeType; message: string } | null>
  >;
};

const ErrorContext = createContext<ErrorContextType | null>(null);

export function ErrorContextProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<{
    code: AppErrorCodeType;
    message: string;
  } | null>(null);

  const props = {
    error,
    setError,
  };
  return (
    <ErrorContext.Provider value={{ ...props }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) throw new Error("UseError has an issue.");
  return context;
}
