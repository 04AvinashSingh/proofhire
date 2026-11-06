import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  AuthUser,
  AuthOrganizationSummary,
  RegisterCandidateRequest,
  RegisterEmployerRequest,
  LoginRequest,
} from "@proofhire/shared-contracts";
import * as api from "../lib/api";

interface AuthContextType {
  user: AuthUser | null;
  activeOrg: AuthOrganizationSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginRequest) => Promise<void>;
  registerCandidate: (dto: RegisterCandidateRequest) => Promise<void>;
  registerEmployer: (dto: RegisterEmployerRequest) => Promise<void>;
  logout: () => Promise<void>;
  switchOrg: (orgId: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeOrg, setActiveOrg] = useState<AuthOrganizationSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.fetchMe();
      setUser(data.user);
      if (data.user.organizations && data.user.organizations.length > 0) {
        setActiveOrg(data.user.organizations[0] || null);
      }
    } catch {
      setUser(null);
      setActiveOrg(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (dto: LoginRequest) => {
    setIsLoading(true);
    try {
      const data = await api.login(dto);
      setUser(data.user);
      if (data.user.organizations && data.user.organizations.length > 0) {
        setActiveOrg(data.user.organizations[0] || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerCandidate = async (dto: RegisterCandidateRequest) => {
    await api.registerCandidate(dto);
  };

  const registerEmployer = async (dto: RegisterEmployerRequest) => {
    await api.registerEmployer(dto);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setActiveOrg(null);
    }
  };

  const switchOrg = (orgId: string) => {
    if (!user) return;
    const found = user.organizations.find((o) => o.id === orgId);
    if (found) {
      setActiveOrg(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        isLoading,
        isAuthenticated: !!user,
        login,
        registerCandidate,
        registerEmployer,
        logout,
        switchOrg,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
