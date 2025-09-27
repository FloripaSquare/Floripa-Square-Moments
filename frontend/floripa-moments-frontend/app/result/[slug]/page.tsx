"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import Image from "next/image";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

// --- Tipos ---
type SearchItem = {
  key: string;
  url: string;
};
type SearchOut = {
  count: number;
  items: SearchItem[];
};

// --- Componente do Card da Imagem ---
const ImageCard = memo(function ImageCard({
  item,
  selected,
  toggleSelect,
}: {
  item: SearchItem;
  selected: boolean;
  toggleSelect: (key: string) => void;
}) {
  const handleOpenImage = () => {
    window.open(item.url, "_blank");
  };

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg">
      <Image
        src={item.url}
        alt={`Foto da busca`}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        className={`object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-50 ${
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

// --- Componente Principal da Página ---
export default function ResultPage() {
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const [searchResult, setSearchResult] = useState<SearchOut | null>(null);
  const [displayItems, setDisplayItems] = useState<SearchItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const perPage = 24;
  const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos
  const timeoutRef = useRef<number | undefined>(undefined);
  const slug = params?.["slug"] as string;
  // --- Inatividade e aba minimizada ---
  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        router.push(`/login/${slug}`);
      }, INACTIVITY_TIME);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        router.push(`/login/${slug}`);
      } else {
        resetTimer();
      }
    };

    // Eventos de atividade
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Inicializa o timer
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- Carrega resultados do localStorage ---
  useEffect(() => {
    const stored = localStorage.getItem("search_result");
    if (stored) {
      const result = JSON.parse(stored) as SearchOut;
      const uniqueItems = Array.from(
        new Map(result.items.map((item) => [item.key, item])).values()
      );

      setSearchResult({ count: uniqueItems.length, items: uniqueItems });
      setDisplayItems(uniqueItems.slice(0, perPage));
    }
  }, []);

  // --- Scroll infinito ---
  useEffect(() => {
    if (!searchResult) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          setDisplayItems((prevItems) => {
            if (prevItems.length >= searchResult.items.length) return prevItems;
            return searchResult.items.slice(0, prevItems.length + perPage);
          });
        }
      },
      { rootMargin: "200px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [searchResult]);

  // --- Seleção de fotos ---
  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  // --- Download múltiplo ---
  const downloadSelected = async () => {
    if (!searchResult) return;

    const selectedItems = searchResult.items.filter((item) =>
      selectedKeys.has(item.key)
    );

    for (const item of selectedItems) {
      try {
        const response = await fetch(item.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = item.key; // pode ajustar para o filename que quiser
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Erro ao baixar imagem:", err);
      }
    }
  };

  if (!params?.slug) return <StateMessage message="Nenhuma busca informada." />;
  if (!searchResult)
    return <StateMessage showSpinner message="Carregando resultados..." />;
  if (searchResult.items.length === 0)
    return <StateMessage message="Nenhuma foto encontrada para sua busca." />;

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-center text-xl font-bold text-gray-800 sm:text-left sm:text-2xl md:text-3xl">
            {searchResult.count} foto{searchResult.count !== 1 ? "s" : ""}{" "}
            encontrada{searchResult.count !== 1 ? "s" : ""}
          </h1>
          <p className="text-gray-600">
            Pressione por alguns segundos a foto para opções de download direto
            no celular
          </p>

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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayItems.map((item) => (
            <ImageCard
              key={item.key}
              item={item}
              selected={selectedKeys.has(item.key)}
              toggleSelect={toggleSelect}
            />
          ))}
        </div>

        <div ref={loaderRef} className="flex h-20 items-center justify-center">
          {displayItems.length < searchResult.items.length && (
            <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
          )}
        </div>
      </div>
    </main>
  );
}

// --- Componente auxiliar para mensagens ---
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
