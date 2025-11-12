/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Comment {
  id: string;
  user_id: string;
  event_slug: string;
  user_full_name: string;
  comment: string;
  created_at: string;
}

interface Props {
  eventSlug: string;
  // opcional: permitir recarga automática
  pollIntervalMs?: number | null;
}

export default function EventCommentsList({
  eventSlug,
  pollIntervalMs = null,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventSlug) return;

    let mounted = true;
    let timer: number | undefined;

    async function fetchComments() {
      setLoading(true);
      setError(null);
      try {
        // endpoint no mesmo padrão que você usou antes
        const res = await fetch(`${API_URL}/comments/${eventSlug}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Erro ao buscar comentários (${res.status})`);
        }
        const data = await res.json();
        if (!mounted) return;
        // Supondo que a API retorne array de comentários
        setComments(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Erro desconhecido");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchComments();

    if (pollIntervalMs && pollIntervalMs > 0) {
      timer = window.setInterval(fetchComments, pollIntervalMs);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [eventSlug, pollIntervalMs]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-6">
        <div className="text-sm text-gray-500">Carregando comentários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 rounded-md text-red-700 text-sm">
        Erro ao carregar comentários: {error}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="w-full p-6 text-center text-gray-400">
        Nenhum comentário encontrado para este evento.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {comments.map((c) => (
        <article
          key={c.id}
          className="w-full bg-white/90 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                {c.comment}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Usuário:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {c.user_full_name}
                  </span>
                </span>
                <span className="mx-2">•</span>
                <time dateTime={c.created_at}>
                  {new Date(c.created_at).toLocaleString("pt-BR")}
                </time>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
