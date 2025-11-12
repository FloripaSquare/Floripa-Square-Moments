"use client";

import React, { useEffect, useState, useRef, memo } from "react";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

// --- Tipos ---
type SearchItem = { key: string; url: string };
type SearchOut = { count: number; items: SearchItem[] };

// --- Função Utilitária para a Métrica ---
async function trackDownloadIntent(slug: string, fileName: string) {
  console.log("Tracking download intent for:", fileName);
  const token = localStorage.getItem("user_token");
  if (!token) return;

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
    await fetch(`${API_URL}/admin/metrics/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event_slug: slug, file_name: fileName }),
    });
    console.log(`Métrica registrada para: ${fileName}`);
  } catch (error) {
    console.error("Falha ao registrar métrica:", error);
  }
}

// --- DOWNLOAD FORÇADO (apenas desktop) ---
async function forceDownload(url: string, filenameKey: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Falha: ${response.statusText}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const cleanFilename = filenameKey.split("/").pop() || "foto.jpg";

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Erro ao fazer download:", err);
    alert("Não foi possível baixar a imagem.");
  }
}

// --- CARD DE IMAGEM ---
const ImageCard = memo(function ImageCard({
  item,
  slug,
}: {
  item: SearchItem;
  slug: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && navigator.maxTouchPoints > 1);

  // --- MOBILE: registra métrica ao toque longo ---
  const touchTimeout = useRef<number | null>(null);

  const handleTouchStart = () => {
    touchTimeout.current = window.setTimeout(() => {
      trackDownloadIntent(slug, item.key);
      console.log("Métrica registrada (mobile touch)");
      // Não fazer mais nada — deixa o menu nativo do sistema aparecer
    }, 600); // 600ms = tempo padrão de long press
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
  };

  // --- DESKTOP: clique direito força download ---
  const handleContextMenu = async (e: React.MouseEvent) => {
    if (isMobile) return; // evita interferir no mobile
    e.preventDefault();
    if (isDownloading) return;

    trackDownloadIntent(slug, item.key);
    setIsDownloading(true);
    try {
      await forceDownload(item.url, item.key);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg">
      <img
        src={item.url}
        alt="Foto"
        className="w-full h-auto object-cover select-none"
        loading="lazy"
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        draggable={false}
        style={{ cursor: isMobile ? "auto" : "pointer" }}
      />

      {isDownloading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm text-white font-semibold pointer-events-none">
          <ArrowPathIcon className="h-8 w-8 animate-spin" />
          <span>A guardar...</span>
        </div>
      )}
    </div>
  );
});

// --- PÁGINA PRINCIPAL ---
export default function ResultPage() {
  const [slug, setSlug] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchOut | null>(null);
  const [displayItems, setDisplayItems] = useState<SearchItem[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const perPage = 24;

  // --- Obter slug ---
  useEffect(() => {
    const path = window.location.pathname;
    const lastSegment = path.split("/").filter(Boolean).pop();
    if (lastSegment && lastSegment !== "preview") {
      setSlug(lastSegment);
    } else {
      setSlug(localStorage.getItem("current_event_slug") || "floripa-square");
    }
  }, []);

  // --- Carregar resultados ---
  useEffect(() => {
    const stored = localStorage.getItem("search_result");
    if (stored) {
      const result = JSON.parse(stored) as SearchOut;
      const unique = Array.from(
        new Map(result.items.map((i) => [i.key, i])).values()
      );
      setSearchResult({ count: unique.length, items: unique });
      setDisplayItems(unique.slice(0, perPage));
    }
  }, []);

  // --- Scroll infinito ---
  useEffect(() => {
    if (!searchResult) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayItems((prev) =>
            searchResult.items.slice(0, prev.length + perPage)
          );
        }
      },
      { rootMargin: "200px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [searchResult]);

  if (!slug)
    return <StateMessage message="Nenhuma busca informada." showSpinner />;
  if (!searchResult)
    return <StateMessage message="Carregando resultados..." showSpinner />;
  if (searchResult.items.length === 0)
    return <StateMessage message="Nenhuma foto encontrada." />;

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-center text-xl font-bold text-gray-800 sm:text-left sm:text-2xl md:text-3xl">
            {searchResult.count} foto
            {searchResult.count !== 1 ? "s encontradas" : " encontrada"}
          </h1>
          <p className="text-center text-sm text-gray-600 sm:text-base">
            Pressione e segure para salvar na galeria
          </p>
        </header>

        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
          {displayItems.map((item) => (
            <div key={item.key} className="break-inside-avoid">
              <ImageCard item={item} slug={slug} />
            </div>
          ))}
        </div>

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

// --- Estado visual ---
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

// --- Footer ---
const Footer = () => (
  <footer className="py-6 text-center text-sm text-gray-500">
    <p>
      &copy; {new Date().getFullYear()} PhotoFind. Todos os direitos reservados.
    </p>
  </footer>
);
