"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ============================================
// TIPOS
// ============================================

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  tenantId: string;
}

// ============================================
// CONTEXTO
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Error al iniciar sesión" };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Error al registrarse" };
      }

      setUser(result.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  }, []);

  // Verificar permiso
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    // Admin tiene todos los permisos
    if (user.roles.includes("Administrador")) return true;

    // Verificar permiso específico (esto vendría del token en producción)
    return true; // Por ahora, permitir todo
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
