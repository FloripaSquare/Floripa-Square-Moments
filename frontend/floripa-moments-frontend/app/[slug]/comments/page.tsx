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
  const [mounted, setMounted] = useState(false);

  // Marca que o componente já montou
  useEffect(() => {
    setMounted(true);
  }, []);

  // Só acessa localStorage depois que estiver montado
  useEffect(() => {
    if (!mounted) return;

    const storedUserId = localStorage.getItem("user_id");
    const storedToken =
      localStorage.getItem("user_token") ||
      localStorage.getItem("access_token");

    if (!storedUserId || !storedToken) {
      router.push(`/${slug}`);
      return;
    }

    setUserId(storedUserId);
    setToken(storedToken);
  }, [mounted, router, slug]);

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

      if (!res.ok) throw new Error(await res.text());
      setComment("");
      alert("✅ Comentário enviado com sucesso!");
    } catch (err) {
      console.error("Erro no envio do comentário:", err);
    }
  };

  if (!mounted) return null; // evita renderização prematura no SSR

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escreva algo..."
        />
        <button type="submit">Enviar</button>
      </form>
    </main>
  );
}
