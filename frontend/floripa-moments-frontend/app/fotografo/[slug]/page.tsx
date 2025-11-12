"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import Footer from "@/components/Footer";

export default function PhotographerLogin() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao fazer login");

      // salva o token
      localStorage.setItem("photographer_token", data.access_token);

      const redirectSlug = data.user?.event_slug || data.event_slug;
      if (!redirectSlug) {
        setAlert({ type: "error", message: "Evento do usuário não definido" });
        return;
      }

      setAlert({
        type: "success",
        message: "Login realizado! Redirecionando...",
      });
      setTimeout(() => {
        router.push(`/fotografo/${redirectSlug}/painel`);
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Login do Fotógrafo
          </h1>

          {alert && (
            <div
              className={`flex items-center p-3 mb-4 rounded-md text-sm ${
                alert.type === "error"
                  ? "bg-red-50 text-red-800"
                  : "bg-green-50 text-green-800"
              }`}
            >
              {alert.type === "error" ? (
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email Profissional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-600"
                placeholder="seuemail@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-600"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 bg-blue-700 text-white font-semibold rounded-md shadow-sm hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
