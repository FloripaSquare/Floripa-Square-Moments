"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import Footer from "@/components/Footer";

// --- Tipos ---
type SearchItem = { key: string; url: string };
type SearchOut = { count: number; items: SearchItem[] };

// --- Função Utilitária para a Métrica (sem alterações) ---
async function trackDownloadIntent(slug: string, fileName: string) {
  console.log("Tracking download intent for:", fileName);
  const token = localStorage.getItem("user_token");
  if (!token) {
    console.warn(
      "Métrica de download não registrada: token de usuário não encontrado."
    );
    return;
  }
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    await fetch(`${API_URL}/admin/metrics/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event_slug: slug, file_name: fileName }),
    });
    console.log(`Métrica de download registrada para: ${fileName}`);
  } catch (error) {
    console.error("Falha ao registrar métrica de download:", error);
  }
}

// --- Componente do Card da Imagem (VERSÃO DEFINITIVA COM MENU NATIVO) ---
const ImageCard = memo(function ImageCard({
  item,
  slug,
}: {
  item: SearchItem;
  slug: string;
}) {
  const [showSaveHint, setShowSaveHint] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  // Inicia quando o usuário TOCA ou CLICA
  const handleInteractionStart = () => {
    pressTimer.current = setTimeout(() => {
      // 🥇 A MÉTRICA É DISPARADA AQUI, ao confirmar a intenção
      trackDownloadIntent(slug, item.key);
      setShowSaveHint(true);
    }, 500); // Meio segundo para o "long press"
  };

  // Termina quando o usuário SOLTA o dedo/mouse
  const handleInteractionEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    setShowSaveHint(false);
  };

  // Fallback para clique direito no desktop
  const handleContextMenu = (e: React.MouseEvent) => {
    // Impede o menu nativo de aparecer se a nossa UI já estiver visível (evita conflito)
    if (showSaveHint) e.preventDefault();
    trackDownloadIntent(slug, item.key);
  };

  return (
    <div
      className="group relative w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg"
      // Eventos para mobile e desktop no container principal
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd} // Garante limpeza se o toque for interrompido
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onContextMenu={handleContextMenu}
    >
      <img
        src={item.url}
        alt={`Foto da busca`}
        className="w-full h-auto object-cover"
        loading="lazy"
      />

      {/* Checkbox removido */}

      {/* ✅ NOSSA NOVA UI DE AVISO - Ela é "transparente" a eventos de mouse/toque */}
      {showSaveHint && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-sm text-white font-semibold pointer-events-none">
          <ArrowDownTrayIcon className="h-8 w-8" />
          <span>Solte para ver opções</span>
        </div>
      )}
    </div>
  );
});

// --- Componente Principal da Página ---
export default function ResultPage() {
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const [searchResult, setSearchResult] = useState<SearchOut | null>(null);
  const [displayItems, setDisplayItems] = useState<SearchItem[]>([]);
  // Estado 'selectedKeys' removido
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const perPage = 24;
  const INACTIVITY_TIME = 5 * 60 * 1000;
  const timeoutRef = useRef<number | undefined>(undefined);
  const slug = params?.["slug"] as string;

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
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
    events.forEach((event) => window.addEventListener(event, resetTimer));
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [slug, router]);

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

  useEffect(() => {
    if (!searchResult) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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

  // Função 'toggleSelect' removida
  // Função 'downloadSelected' removida

  if (!slug) return <StateMessage message="Nenhuma busca informada." />;
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
          <p className="text-center text-sm text-gray-600 sm:text-base">
            Pressione e segure a foto para salvar
          </p>
          {/* Botão de download removido */}
        </header>

        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
          {displayItems.map((item) => (
            <div key={item.key} className="break-inside-avoid">
              <ImageCard
                item={item}
                slug={slug}
                // Props 'selected' e 'toggleSelect' removidas
              />
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

// --- Componente auxiliar para mensagens (sem alterações) ---
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
