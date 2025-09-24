"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { bulkUpload } from "@/lib/api";

export default function BulkUpload() {
  const { slug } = useParams<{ slug: string }>();

  const [files, setFiles] = useState<FileList | null>(null);
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  async function handleUpload() {
    if (!files?.length) return;
    try {
      const arr = Array.from(files);
      const res = await bulkUpload(slug, arr, user, pass);
      setMsg(`Enviados: ${res.ingested}`);
    } catch (err: unknown) {
      setMsg(
        err instanceof Error ? "Erro: " + err.message : "Erro inesperado."
      );
    }
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload em lote – {slug}</h1>

      <input
        type="text"
        placeholder="Usuário"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <input
        type="password"
        placeholder="Senha"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(e.target.files)}
        className="mb-2"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enviar
      </button>

      {msg && <p className="mt-4">{msg}</p>}
    </main>
  );
}
