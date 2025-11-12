"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_URL } from "@/lib/api";

type Theme = {
  backgroundImage?: string;
  textColor: string;
  primaryButton: string;
  secondaryButton: string;
  ghostButton: string;
};

const themes: Record<string, Theme> = {
  "floripa-square": {
    backgroundImage: "url('/base-moments.jpg')",
    textColor: "text-white",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-[#f37021]",
  },
  default: {
    backgroundImage: "url('/base-moments.jpg')",
    textColor: "text-white",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-[#f37021]",
  },
};

export default function CommentsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "default";
  const theme = themes[slug] || themes.default;

  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedToken =
      localStorage.getItem("user_token") ||
      localStorage.getItem("access_token");

    if (!storedUserId || !storedToken) {
      router.push(`/${slug}/login`);
      return;
    }

    setUserId(storedUserId);
    setToken(storedToken);
  }, [router, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!comment.trim() || !token || !userId) return;

    try {
      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_slug: slug,
          user_id: userId,
          comment,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setComment("");
      setSuccessMessage("✅ Comentário enviado com sucesso!");
    } catch (err) {
      console.error("Erro no envio do comentário:", err);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${slug}`);
    }
  };

  // Classe base para botões
  const baseButtonClasses =
    "w-full py-3 px-5 rounded-xl font-semibold text-sm md:text-base uppercase shadow-md transition-colors duration-200 ease-in-out disabled:opacity-50";

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center">
      {/* Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: theme.backgroundImage }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-xl px-6 py-10 flex flex-col items-center">
        <h1
          className={`text-2xl font-bold mb-6 text-center drop-shadow ${theme.textColor}`}
        >
          Deixe seu comentário
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-3"
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva algo sobre o evento..."
            className="w-full rounded-xl p-4 text-gray-800 bg-white/90 shadow-md outline-none focus:ring-2 focus:ring-[#f37021] min-h-[100px]"
          />

          <button
            type="submit"
            className={`${baseButtonClasses} ${theme.primaryButton}`}
          >
            Enviar Comentário
          </button>
        </form>

        {successMessage && (
          <p className="text-green-400 font-semibold mt-4 text-center">
            {successMessage}
          </p>
        )}

        <div className="w-1/2 h-px bg-white/30 my-10" />
      </div>
    </main>
  );
}
