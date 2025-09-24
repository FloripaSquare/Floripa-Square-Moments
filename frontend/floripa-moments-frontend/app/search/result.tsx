"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import type { SearchOut, ItemUrl } from "@/lib/types";
import Image from "next/image";

export default function ResultPage() {
  const params = useParams<{ slug?: string }>();
  const eventSlug = params?.slug;

  const [items, setItems] = useState<ItemUrl[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPhotos = useCallback(
    async (cursor: string | null = null) => {
      if (!eventSlug) return;

      setLoading(true);
      try {
        const url =
          `/api/search/${eventSlug}` +
          (cursor ? `?last_seen_key=${cursor}` : "");
        const res = await fetch(url);
        const data: SearchOut = await res.json();

        const validItems = data.items.filter(
          (item) => item.url && item.url.trim() !== ""
        );

        setItems((prev) => [...prev, ...validItems]);
        setNextCursor(data.nextCursor || null);
      } catch (err) {
        console.error("Erro ao buscar fotos:", err);
      } finally {
        setLoading(false);
      }
    },
    [eventSlug]
  );

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        containerRef.current &&
        window.innerHeight + window.scrollY >=
          containerRef.current.scrollHeight - 400 &&
        !loading &&
        nextCursor
      )
        fetchPhotos(nextCursor);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextCursor, loading, fetchPhotos]);

  const downloadFile = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "foto.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!eventSlug) {
    return (
      <main className="min-h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mt-2 text-gray-600">
            O slug do evento não foi encontrado.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6" ref={containerRef}>
      <h1 className="text-2xl font-bold mb-4">
        Fotos encontradas no evento {eventSlug}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <div key={i} className="relative group">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Image
                src={item.url}
                alt={`foto-${i}`}
                width={300}
                height={300}
                className="rounded-xl shadow object-cover w-full h-full"
              />
            </a>
            <button
              type="button"
              onClick={() => downloadFile(item.url)}
              className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              Baixar
            </button>
          </div>
        ))}
      </div>

      {loading && <p className="text-center mt-4">Carregando...</p>}

      {items.length > 0 && (
        <div className="mt-6">
          <a
            href={`/api/search/${eventSlug}/download`}
            target="_blank"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            Baixar todas em ZIP
          </a>
        </div>
      )}
    </main>
  );
}
