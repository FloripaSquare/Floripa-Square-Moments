"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import Footer from "@/components/Footer";

// --- Tipos ---
type SearchItem = { key: string; url: string };
type SearchOut = { count: number; items: SearchItem[] };

// --- Card de imagem ---
const ImageCard = memo(function ImageCard({
  item,
  selected,
  toggleSelect,
}: {
  item: SearchItem;
  selected: boolean;
  toggleSelect: (key: string) => void;
}) {
  const handleOpenImage = () => window.open(item.url, "_blank");

  return (
    <div className="group relative w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg">
      <img
        src={item.url}
        alt={item.key}
        className={`w-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-50 ${
          selected ? "ring-4 ring-blue-500" : ""
        }`}
      />
      <input
        type="checkbox"
        checked={selected}
        onChange={() => toggleSelect(item.key)}
        className="absolute top-2 left-2 z-20 h-5 w-5 cursor-pointer accent-blue-500"
      />
      <button
        onClick={handleOpenImage}
        title="Abrir esta foto"
        className="absolute bottom-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white"
      >
        <ArrowDownTrayIcon className="h-6 w-6" />
      </button>
    </div>
  );
});

// --- Página principal ---
export default function GeneralGalleryPage() {
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const slug = params?.slug;
  const [searchResult, setSearchResult] = useState<SearchOut | null>(null);
  const [displayItems, setDisplayItems] = useState<SearchItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const perPage = 24;
  const INACTIVITY_TIME = 5 * 60 * 1000;
  const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

  // --- Logout automático ---
  useEffect(() => {
    if (!slug) return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        router.push(`/login/${slug}`);
      }, INACTIVITY_TIME);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) router.push(`/login/${slug}`);
      else resetTimer();
    };

    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
    ];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [slug, router]);

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

  // --- Seleção de imagens ---
  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  // --- Download múltiplo ---
  const downloadSelected = async () => {
    if (!searchResult) return;
    const selectedItems = searchResult.items.filter((i) =>
      selectedKeys.has(i.key)
    );

    for (const item of selectedItems) {
      try {
        const res = await fetch(item.url);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = item.key;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.error("Erro ao baixar imagem:", err);
      }
    }
  };

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
          {selectedKeys.size > 0 && (
            <button
              onClick={downloadSelected}
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Baixar selecionadas ({selectedKeys.size})
            </button>
          )}
        </header>

        {/* Masonry Layout */}
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
          {displayItems.map((item) => (
            <div key={item.key} className="break-inside-avoid">
              <ImageCard
                item={item}
                selected={selectedKeys.has(item.key)}
                toggleSelect={toggleSelect}
              />
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
