/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

interface DownloadPasswordModalProps {
  slug: string;
  onClose: () => void;
}

export default function DownloadPasswordModal({
  slug,
  onClose,
}: DownloadPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(
        `${API_URL}/admin/downloads/start?slug=${slug}&password=${password}`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erro desconhecido");
      }

      const { url } = await res.json();

      // abrir para o usuário
      window.location.href = url;

      onClose();
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80 shadow">
        <h2 className="text-lg font-bold mb-3">Digite a senha</h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          placeholder="Senha para baixar"
        />

        {status === "error" && (
          <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={status === "loading"}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {status === "loading" ? "Validando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
