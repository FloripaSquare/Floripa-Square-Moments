"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import Image from "next/image";
import {
  ArrowDownTrayIcon,
  ArchiveBoxArrowDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// --- Tipos ---
type SearchItem = {
  key: string;
  url: string;
};
type SearchOut = {
  count: number;
  items: SearchItem[];
  zip: string | null;
};

// --- Componente do Card da Imagem (Otimizado e Corrigido) ---
const ImageCard = memo(function ImageCard({ item }: { item: SearchItem }) {
  const getOriginalFilename = (s3Key: string): string => {
    const parts = s3Key.split("-");
    if (parts.length > 2) {
      return decodeURIComponent(parts.slice(2).join("-").replace(/_/g, " "));
    }
    return s3Key.split("/").pop() || "download.jpg";
  };

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg">
      <Image
        src={item.url}
        alt={`Foto da busca`}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-50"
      />
      <a
        href={item.url}
        download={getOriginalFilename(item.key)}
        title="Baixar esta foto"
        className="absolute bottom-2 right-2 z-10 flex h-10 w-10 translate-y-14 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 hover:bg-white"
      >
        <ArrowDownTrayIcon className="h-6 w-6" />
      </a>
    </div>
  );
});

// --- Componente Principal da Página ---
export default function ResultPage() {
  const params = useParams<{ slug?: string }>();
  const [searchResult, setSearchResult] = useState<SearchOut | null>(null);
  const [displayItems, setDisplayItems] = useState<SearchItem[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const perPage = 24;

  // Carrega os resultados do localStorage e remove duplicatas
  useEffect(() => {
    const stored = localStorage.getItem("search_result");
    if (stored) {
      const result = JSON.parse(stored) as SearchOut;

      // CORREÇÃO: Remove itens com chaves duplicadas
      const uniqueItems = Array.from(
        new Map(result.items.map((item) => [item.key, item])).values()
      );

      const uniqueResult = {
        ...result,
        items: uniqueItems,
        count: uniqueItems.length,
      };

      setSearchResult(uniqueResult);
      setDisplayItems(uniqueResult.items.slice(0, perPage));
    }
  }, []);

  // Lógica do scroll infinito corrigida para não recriar o observer
  useEffect(() => {
    if (!searchResult) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          setDisplayItems((prevItems) => {
            if (prevItems.length >= searchResult.items.length) {
              return prevItems;
            }
            const nextItems = searchResult.items.slice(
              0,
              prevItems.length + perPage
            );
            return nextItems;
          });
        }
      },
      { rootMargin: "200px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [searchResult]); // Dependência estável, executa apenas quando os resultados mudam

  const getOriginalFilename = (s3Key: string): string => {
    const parts = s3Key.split("-");
    if (parts.length > 2) {
      return decodeURIComponent(parts.slice(2).join("-").replace(/_/g, " "));
    }
    return s3Key.split("/").pop() || "download.jpg";
  };

  const downloadAllAsZip = async () => {
    if (!searchResult || isZipping) return;
    setIsZipping(true);
    const zip = new JSZip();
    const promises = searchResult.items.map(async (item) => {
      try {
        const response = await fetch(item.url);
        const blob = await response.blob();
        const filename = getOriginalFilename(item.key);
        zip.file(filename, blob);
      } catch (error) {
        console.error(`Falha ao baixar ${item.key}:`, error);
      }
    });

    await Promise.all(promises);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `fotos-${params?.slug ?? "resultados"}.zip`);
    setIsZipping(false);
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
          <button
            onClick={downloadAllAsZip}
            disabled={isZipping}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
          >
            {isZipping ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ArchiveBoxArrowDownIcon className="h-5 w-5" />
            )}
            {isZipping ? "Compactando..." : "Baixar Todas (ZIP)"}
          </button>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayItems.map((item) => (
            <ImageCard key={item.key} item={item} />
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

// Componente auxiliar para mensagens de estado
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
