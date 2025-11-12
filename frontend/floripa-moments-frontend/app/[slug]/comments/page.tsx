"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Props {
  slug: string;
  buttonClass: string; // estilo do botão de abrir o modal
  modalButtonClass: string; // estilo do botão dentro do modal
}

export default function FeedbackPopup({
  slug,
  buttonClass,
  modalButtonClass,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedToken =
      localStorage.getItem("user_token") ||
      localStorage.getItem("access_token");

    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

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
      setIsOpen(false);
    } catch (err) {
      console.error("Erro no envio do comentário:", err);
      alert("❌ Falha ao enviar comentário.");
    }
  };

  if (loading) return null;

  return (
    <>
      {/* Botão para abrir o modal */}
      <button
        type="button"
        className={buttonClass}
        onClick={() => setIsOpen(true)}
      >
        Deixe seu Feedback
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Deixe seu comentário
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva algo sobre o evento..."
                className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
              />
              {/* Botão dentro do modal agora usa estilo primário */}
              <button
                type="submit"
                className={`${modalButtonClass} w-full text-center`}
              >
                Enviar Comentário
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
