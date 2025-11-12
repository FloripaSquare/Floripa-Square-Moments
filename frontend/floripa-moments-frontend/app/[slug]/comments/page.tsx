"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function CommentsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "default";

  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // indica se ainda estamos carregando user info

  // Carrega user_id e token do localStorage, **somente no client**
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedToken =
      localStorage.getItem("user_token") ||
      localStorage.getItem("access_token");

    if (!storedUserId || !storedToken) {
      router.replace(`/${slug}`); // redirect seguro sem empurrar histórico
      return;
    }

    setUserId(storedUserId);
    setToken(storedToken);
    setLoading(false);
  }, [router, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !token || !userId) return;

    try {
      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event_slug: slug, user_id: userId, comment }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro desconhecido");
      }

      setComment("");
      alert("✅ Comentário enviado com sucesso!");
    } catch (err) {
      console.error("Erro no envio do comentário:", err);
      alert("❌ Falha ao enviar comentário.");
    }
  };

  if (loading) return null; // não renderiza nada até carregar localStorage

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4"
      >
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escreva algo sobre o evento..."
          className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={5}
        />
        <button
          type="submit"
          className="py-3 px-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Enviar Comentário
        </button>
      </form>
    </main>
  );
}
