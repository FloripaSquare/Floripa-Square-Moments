/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useParams } from "next/navigation";

export default function DownloadPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownload = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/downloads/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Senha inválida.");
      }

      // redireciona para download real
      window.location.href = data.download_url;
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-4">
          Baixar Fotos do Evento
        </h1>

        <p className="text-gray-600 text-sm mb-4 text-center">
          Digite a senha enviada pelo fotógrafo.
        </p>

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded mb-3"
        />

        {status === "error" && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleDownload}
          disabled={status === "loading"}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {status === "loading" ? "Validando..." : "Baixar Fotos"}
        </button>
      </div>
    </div>
  );
}
