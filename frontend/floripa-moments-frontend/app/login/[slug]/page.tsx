"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Footer from "@/components/Footer";

// --- Tema ---
interface Theme {
  name: string;
  backgroundImage: string;
  textColor: string;
  inputBg: string;
  inputBorder: string;
  placeholderColor: string;
  buttonBg: string;
  buttonTextColor: string;
  buttonBorder: string;
  alertErrorBg: string;
  alertErrorText: string;
  alertSuccessBg: string;
  alertSuccessText: string;
}

const themes: Record<string, Theme> = {
  fs: {
    name: "Floripa Square",
    backgroundImage: "url('/base-moments.jpg')",
    textColor: "text-white",
    inputBg: "bg-white/90",
    inputBorder: "border-white/50",
    placeholderColor: "placeholder-gray-400",
    buttonBg: "bg-[#f37021]",
    buttonTextColor: "text-white",
    buttonBorder: "border-[#f37021]",
    alertErrorBg: "bg-red-50",
    alertErrorText: "text-red-700",
    alertSuccessBg: "bg-green-50",
    alertSuccessText: "text-green-700",
  },
  kotai: {
    name: "Kotai",
    backgroundImage: "url('/kotai/fundo-kotai.jpg')",

    // TEXTOS
    textColor: "text-[#f2f2f3]",

    // INPUTS
    inputBg: "bg-white/90",
    inputBorder: "border-[#67b7ff]/50",
    placeholderColor: "placeholder-gray-500",

    // BOTÃO — Verde Neon (#00fe91)
    buttonBg: "bg-[#00fe91]",
    buttonTextColor: "text-black",
    buttonBorder: "border-[#00fe91]",
    // ALERTAS
    alertErrorBg: "bg-red-100",
    alertErrorText: "text-red-700",
    // Sucesso em azul claro (#67b7ff)
    alertSuccessBg: "bg-[#67b7ff]/20",
    alertSuccessText: "text-[#67b7ff]",
  },
  aegea: {
    name: "Aegea",
    backgroundImage: "url('/aegea/fundo-aegea.jpg')",
    
    // TEXTOS
    textColor: "text-[#f2f2f3]",
    // INPUTS
    inputBg: "bg-white/90",
    inputBorder: "border-[#67b7ff]/50",
    placeholderColor: "placeholder-gray-500",
    // BOTÃO — Verde Neon (#00fe91)
    buttonBg: "bg-[#00fe91]",
    buttonTextColor: "text-black",
    buttonBorder: "border-[#00fe91]",
    // ALERTAS
    alertErrorBg: "bg-red-100",
    alertErrorText: "text-red-700",
    // Sucesso em azul claro (#67b7ff)
    alertSuccessBg: "bg-[#67b7ff]/20",
    alertSuccessText: "text-[#67b7ff]",
  },

  default: {
    name: "Floripa Square",
    backgroundImage: "url('/base-moments.jpg')",
    textColor: "text-white",
    inputBg: "bg-white/90",
    inputBorder: "border-white/50",
    placeholderColor: "placeholder-gray-400",
    buttonBg: "bg-[#f37021]",
    buttonTextColor: "text-white",
    buttonBorder: "border-[#f37021]",
    alertErrorBg: "bg-red-50",
    alertErrorText: "text-red-700",
    alertSuccessBg: "bg-green-50",
    alertSuccessText: "text-green-700",
  },
};

export default function UserLoginPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? "default";

  const theme = themes[slug] || themes.default;

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
      localStorage.setItem("user_id", data.user.id);
      setAlert({ type: "success", message: "Login realizado com sucesso!" });

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
        style={{ backgroundImage: theme.backgroundImage }}
      >
        <div className="w-full max-w-md p-6 rounded-md">
          <h1
            className={`text-2xl font-bold mb-6 text-center ${theme.textColor}`}
          >
            Login
          </h1>

          {alert && (
            <div
              className={`flex items-center p-3 mb-4 rounded-md text-sm ${
                alert.type === "error"
                  ? `${theme.alertErrorBg} ${theme.alertErrorText}`
                  : `${theme.alertSuccessBg} ${theme.alertSuccessText}`
              }`}
            >
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-bold mb-1 ${theme.textColor}`}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className={`w-full ${theme.inputBg} ${theme.inputBorder} border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 ${theme.placeholderColor}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-bold mb-1 ${theme.textColor}`}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className={`w-full ${theme.inputBg} ${theme.inputBorder} border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 ${theme.placeholderColor}`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2 px-4 font-semibold rounded-md ${theme.buttonBg} ${theme.buttonTextColor} border ${theme.buttonBorder}`}
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
