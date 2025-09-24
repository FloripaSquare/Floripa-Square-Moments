"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { bulkUpload } from "@/lib/api";

export default function BulkUpload() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;

  const [files, setFiles] = useState<FileList | null>(null);
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  async function handleUpload() {
    if (!slug || !files?.length) {
      setMsg("Erro: Slug não encontrado ou nenhum arquivo selecionado.");
      return;
    }

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

  // Se o slug não for válido, exibe uma mensagem de erro em vez de quebrar o componente
  if (!slug) {
    return (
      <main className="p-6 max-w-lg mx-auto text-center text-red-600">
        <h1 className="text-xl font-bold mb-4">Erro de URL</h1>
        <p>O slug do evento não foi encontrado na URL. Verifique o endereço.</p>
      </main>
    );
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
