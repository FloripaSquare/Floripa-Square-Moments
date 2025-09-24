"use client";
import { useState } from "react";
import Image from "next/image"; // ✨ Importe o componente Image do Next.js
import { searchFaces } from "@/lib/api";
import type { SearchOut, ItemUrl } from "@/lib/types";

export default function EventPage({ params }: { params: { slug: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<SearchOut | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!file) return;
    setLoading(true);
    try {
      const data = await searchFaces(params.slug, file);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Encontre suas fotos</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleSearch}
        disabled={!file || loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Buscando..." : "Buscar"}
      </button>

      {results && (
        <div className="grid grid-cols-2 gap-2 mt-6">
          {results.items.map((it: ItemUrl) => (
            // ✨ Adicione 'key' e 'rel' ao link
            <a
              key={it.key}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-full h-auto rounded shadow overflow-hidden">
                {/* ✨ Use o componente <Image /> */}
                <Image
                  src={it.url}
                  alt="Foto encontrada na busca" // ✨ Adicione uma descrição para acessibilidade
                  width={600} // Valor de largura de exemplo
                  height={600} // Valor de altura de exemplo
                  className="w-full h-full object-cover"
                  unoptimized // ✨ opcional, se as imagens já estiverem otimizadas
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
