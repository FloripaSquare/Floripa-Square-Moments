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
  const slug = params?.slug ?? "";

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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao fazer login");
      }

      const data = await res.json();
      localStorage.setItem("photographer_token", data.access_token);

      setAlert({
        type: "success",
        message: "Login realizado com sucesso! Redirecionando...",
      });

      setTimeout(() => router.push(`/fotografo/${slug}/painel`), 1000);
    } catch (err: unknown) {
      let message = "Erro desconhecido";
      if (err instanceof Error) message = err.message;
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
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
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 bg-blue-700 text-white font-semibold rounded-md shadow-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  );
}
