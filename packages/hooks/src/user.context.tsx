"use client";
import React from "react";
import { useState, createContext, useContext } from "react";

type UserContextValue = {
  currentUser: UserContextType | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserContextType | null>>;
};

type UserContextType = {
  userId: string;
  name: string;
  avatar: string;
};
const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserContextType | null>(null);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be inside userProvider");
  }
  return context;
}
