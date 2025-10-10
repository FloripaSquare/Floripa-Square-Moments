"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Footer from "@/components/Footer";

export default function UserLoginPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;
  const isFloripaSquare = slug === "floripa-square";

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
        throw new Error(errData.detail || "Email ou senha inválidos");
      }

      const data = await res.json();

      localStorage.setItem("user_token", data.access_token);

      setAlert({ type: "success", message: "Login realizado com sucesso!" });

      // Redireciona para a página de selfie / busca
      setTimeout(() => router.push(`/${slug}/selfie`), 800);
    } catch (err: unknown) {
      if (err instanceof Error)
        setAlert({ type: "error", message: err.message });
      else setAlert({ type: "error", message: "Erro desconhecido" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center p-8 bg-cover bg-center"
        style={{
          backgroundImage: isFloripaSquare
            ? "url('/bg-form-moments.png')"
            : "url('/bg-form.png')",
        }}
      >
        <div className="w-full max-w-md p-6 rounded-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-white-800">
            Login
          </h1>

          {alert && (
            <div
              className={`flex items-center p-3 mb-4 rounded-md text-sm ${
                alert.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full bg-gray-100 border border-gray-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full bg-gray-100 border border-gray-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4  text-white font-semibold border border-white "
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
