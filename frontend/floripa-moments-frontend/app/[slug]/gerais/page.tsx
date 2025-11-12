"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import Footer from "@/components/Footer";

// --- Tipos ---
type SearchItem = { key: string; url: string };
type SearchOut = { count: number; items: SearchItem[] };

// --- Card de imagem simplificado ---
const ImageCard = memo(function ImageCard({ item }: { item: SearchItem }) {
  const handleOpenImage = () => window.open(item.url, "_blank");

  return (
    <div
      onClick={handleOpenImage}
      className="group relative w-full cursor-pointer overflow-hidden rounded-lg bg-gray-200 shadow-lg"
    >
      <img
        src={item.url}
        alt={item.key}
        className="w-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-50"
      />
    </div>
  );
});

// --- Página principal ---
export default function GeneralGalleryPage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;
  const [searchResult, setSearchResult] = useState<SearchOut | null>(null);
  const [displayItems, setDisplayItems] = useState<SearchItem[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const perPage = 24;
  const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

  // --- Buscar fotos gerais ---
  useEffect(() => {
    if (!slug) return;

    const fetchGeneralPhotos = async () => {
      try {
        const base = API_ORIGIN.endsWith("/")
          ? API_ORIGIN.slice(0, -1)
          : API_ORIGIN;
        const url = base
          ? `${base}/gallery/${encodeURIComponent(slug)}/general`
          : `/gallery/${encodeURIComponent(slug)}/general`;

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Erro ao carregar fotos (${res.status})`);

        const data: SearchItem[] = await res.json();
        const unique = Array.from(
          new Map(data.map((i) => [i.key, i])).values()
        );

        setSearchResult({ count: unique.length, items: unique });
        setDisplayItems(unique.slice(0, perPage));
      } catch (err) {
        console.error("[DEBUG] Erro ao buscar fotos gerais:", err);
        setSearchResult({ count: 0, items: [] });
      }
    };

    fetchGeneralPhotos();
  }, [slug, API_ORIGIN]);

  // --- Scroll infinito ---
  useEffect(() => {
    if (!searchResult) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setDisplayItems((prev) => {
            if (prev.length >= searchResult.items.length) return prev;
            return searchResult.items.slice(0, prev.length + perPage);
          });
        }
      },
      { rootMargin: "200px" }
    );

    const loader = loaderRef.current;
    if (loader) observer.observe(loader);

    return () => {
      if (loader) observer.unobserve(loader);
      observer.disconnect();
    };
  }, [searchResult]);

  // --- Renderização de estado ---
  if (!slug) return <StateMessage message="Evento inválido." />;
  if (!searchResult)
    return <StateMessage showSpinner message="Carregando fotos gerais..." />;
  if (searchResult.items.length === 0)
    return <StateMessage message="Nenhuma foto geral disponível." />;

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-center text-xl font-bold text-gray-800 sm:text-left sm:text-2xl md:text-3xl">
            Fotos gerais do evento ({searchResult.count})
          </h1>
        </header>

        {/* Masonry Layout */}
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
          {displayItems.map((item) => (
            <div key={item.key} className="break-inside-avoid">
              <ImageCard item={item} />
            </div>
          ))}
        </div>

        {/* Loader */}
        <div ref={loaderRef} className="flex h-20 items-center justify-center">
          {displayItems.length < searchResult.items.length && (
            <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

// --- Componente de mensagem de estado ---
function StateMessage({
  message,
  showSpinner = false,
}: {
  message: string;
  showSpinner?: boolean;
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center">
        {showSpinner && (
          <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-gray-400" />
        )}
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </main>
  );
}
