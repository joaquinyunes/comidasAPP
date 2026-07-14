"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ============================================
// PÁGINA DE LOGIN (staff del restaurante)
// ============================================

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("admin@pizzaria.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Credenciales inválidas");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-red-950 to-gray-950">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/25 mb-4 text-4xl">
            🍕
          </div>
          <h1 className="font-bold text-3xl text-white tracking-tight">
            La <span className="text-red-400">Nonna</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Card glassmorphism */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="admin@pizzaria.com"
                  required
                  className={`h-12 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-red-500/50 focus:ring-red-500/20 transition-all duration-300 ${
                    focused === "email" ? "ring-2 ring-red-500/20 border-red-500/50" : ""
                  }`}
                />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-opacity duration-300 ${focused === "email" ? "opacity-100" : "opacity-30"}`}>
                  ✉️
                </div>
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••"
                  required
                  className={`h-12 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-red-500/50 focus:ring-red-500/20 transition-all duration-300 ${
                    focused === "password" ? "ring-2 ring-red-500/20 border-red-500/50" : ""
                  }`}
                />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-opacity duration-300 ${focused === "password" ? "opacity-100" : "opacity-30"}`}>
                  🔒
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fadeIn">
                <span className="text-sm">⚠️</span>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Botón */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <p className="text-[11px] text-gray-500 text-center">
              Demo: <span className="text-gray-400">admin@pizzaria.com</span> / <span className="text-gray-400">admin123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          RestaurantOS v0.1.0
        </p>
      </div>
    </div>
  );
}
