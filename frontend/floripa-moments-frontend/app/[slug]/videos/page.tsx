"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import Footer from "@/components/Footer";

// --- Tipos ---
type VideoItem = { key: string; url: string };
type VideoOut = { count: number; items: VideoItem[] };

// --- Card de vídeo (mobile friendly) ---
const VideoCard = memo(function VideoCard({ item }: { item: VideoItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play / Pause com som
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.paused
      ? videoRef.current.play()
      : videoRef.current.pause();
  };

  // Abrir vídeo em nova aba
  const handleOpenVideo = () => {
    window.open(item.url, "_blank");
  };

  // Download do vídeo
  const handleDownload = async () => {
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error("Falha ao baixar vídeo");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.key}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar vídeo:", err);
      alert("❌ Falha ao baixar vídeo");
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg">
      <video
        ref={videoRef}
        src={item.url}
        className="w-full object-cover cursor-pointer"
        playsInline
        loop
        preload="metadata"
        onClick={handlePlayPause}
      />

      {/* Botões sempre visíveis em mobile */}
      <div className="absolute bottom-2 left-2 flex gap-2 z-10">
        <button
          onClick={handleOpenVideo}
          title="Abrir vídeo"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md"
        >
          <ArrowPathIcon className="h-6 w-6" />
        </button>

        <button
          onClick={handleDownload}
          title="Baixar vídeo"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md"
        >
          <ArrowDownTrayIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
});

// --- Página principal ---
export default function VideosGalleryPage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;
  const [videos, setVideos] = useState<VideoOut | null>(null);
  const [displayItems, setDisplayItems] = useState<VideoItem[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const perPage = 16;
  const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

  // --- Buscar vídeos ---
  useEffect(() => {
    if (!slug) return;

    const fetchVideos = async () => {
      try {
        const base = API_ORIGIN.endsWith("/")
          ? API_ORIGIN.slice(0, -1)
          : API_ORIGIN;
        const url = base
          ? `${base}/gallery/${encodeURIComponent(slug)}/videos`
          : `/gallery/${encodeURIComponent(slug)}/videos`;

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Erro ao carregar vídeos (${res.status})`);

        const data: VideoItem[] = await res.json();
        const unique = Array.from(
          new Map(data.map((i) => [i.key, i])).values()
        );

        setVideos({ count: unique.length, items: unique });
        setDisplayItems(unique.slice(0, perPage));
      } catch (err) {
        console.error("[DEBUG] Erro ao buscar vídeos:", err);
        setVideos({ count: 0, items: [] });
      }
    };

    fetchVideos();
  }, [slug, API_ORIGIN]);

  // --- Scroll infinito ---
  useEffect(() => {
    if (!videos) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setDisplayItems((prev) => {
            if (prev.length >= videos.items.length) return prev;
            return videos.items.slice(0, prev.length + perPage);
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
  }, [videos]);

  // --- Estados de renderização ---
  if (!slug) return <StateMessage message="Evento inválido." />;
  if (!videos)
    return <StateMessage showSpinner message="Carregando vídeos..." />;
  if (videos.items.length === 0)
    return <StateMessage message="Nenhum vídeo disponível." />;

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-center text-xl font-bold text-gray-800 sm:text-left sm:text-2xl md:text-3xl">
            Vídeos do evento ({videos.count})
          </h1>
        </header>

        {/* Masonry Layout */}
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
          {displayItems.map((item) => (
            <div key={item.key} className="break-inside-avoid">
              <VideoCard item={item} />
            </div>
          ))}
        </div>

        {/* Loader */}
        <div ref={loaderRef} className="flex h-20 items-center justify-center">
          {displayItems.length < videos.items.length && (
            <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

// --- Mensagem de estado ---
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
