"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import Footer from "@/components/Footer";

// --- Tipos ---
type VideoItem = { key: string; url: string };
type VideoOut = { count: number; items: VideoItem[] };

// --- Card de vídeo ---
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

  // Download nativo
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.key;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg">
      <video
        ref={videoRef}
        src={item.url}
        className="w-full object-cover transition-all duration-300 group-hover:scale-105 cursor-pointer"
        playsInline
        loop
        preload="metadata"
        onClick={handlePlayPause}
      />
      <button
        onClick={handleDownload}
        title="Baixar vídeo"
        className="absolute bottom-2 left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white"
      >
        <ArrowDownTrayIcon className="h-6 w-6" />
      </button>
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
