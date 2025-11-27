/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useParams } from "next/navigation";

export default function DownloadPage() {
  const params = useParams();
  const slug = Array.isArray((params as any)?.slug)
    ? (params as any).slug[0]
    : (params as any)?.slug;

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownload = async () => {
    if (!slug) {
      setErrorMessage("Slug ausente na URL.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // CORREÇÃO IMPORTANTE AQUI → await fetch(...)
      const res = await fetch(
        `${API_URL}/download/validate?slug=${slug}&password=${password}`,
        {
          method: "POST",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Senha inválida ou link expirado.");
      }

      if (data?.download_url) {
        window.location.href = data.download_url;
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message ?? "Erro desconhecido ao validar.");
    } finally {
      setStatus((prev) => (prev === "error" ? "error" : "idle"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-4">
          Baixar Fotos do Evento
        </h1>

        <p className="text-gray-600 text-sm mb-4 text-center">
          Slug: <span className="font-mono">{slug ?? "—"}</span>
        </p>

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded mb-3"
          disabled={status === "loading"}
        />

        {status === "error" && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleDownload}
          disabled={status === "loading" || !password}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {status === "loading" ? "Validando..." : "Baixar Fotos"}
        </button>
      </div>
    </div>
  );
}
