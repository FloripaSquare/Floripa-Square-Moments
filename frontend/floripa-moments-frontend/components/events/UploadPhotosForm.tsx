"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { PhotoIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

type UploadType = "general" | "videos";

interface Event {
  slug: string;
  title: string;
}

interface MediaItem {
  id: string;
  event_slug: string;
  s3_key: string;
  s3_url: string;
  media_type: string;
  created_at: string;
}

interface UploadMediaFormProps {
  events: Event[];
  onUploaded: () => void;
}

// 🚧 MODO DEBUG
const DEBUG_MODE =
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  window.location.search.includes("debug=true");

const FAKE_MEDIA: MediaItem[] = [
  { id: "fake-1", event_slug: "evento-teste-debug", s3_key: "fake/1.jpg", s3_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-2", event_slug: "evento-teste-debug", s3_key: "fake/2.jpg", s3_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-3", event_slug: "evento-teste-debug", s3_key: "fake/3.jpg", s3_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-4", event_slug: "evento-teste-debug", s3_key: "fake/4.jpg", s3_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-5", event_slug: "evento-teste-debug", s3_key: "fake/5.jpg", s3_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-6", event_slug: "evento-teste-debug", s3_key: "fake/6.jpg", s3_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-7", event_slug: "evento-teste-debug", s3_key: "fake/7.jpg", s3_url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-8", event_slug: "evento-teste-debug", s3_key: "fake/8.jpg", s3_url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-9", event_slug: "evento-teste-debug", s3_key: "fake/9.jpg", s3_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-10", event_slug: "evento-teste-debug", s3_key: "fake/10.jpg", s3_url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-11", event_slug: "evento-teste-debug", s3_key: "fake/11.jpg", s3_url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-12", event_slug: "evento-teste-debug", s3_key: "fake/12.jpg", s3_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-13", event_slug: "evento-teste-debug", s3_key: "fake/13.jpg", s3_url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-14", event_slug: "evento-teste-debug", s3_key: "fake/14.jpg", s3_url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-15", event_slug: "evento-teste-debug", s3_key: "fake/15.jpg", s3_url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-16", event_slug: "evento-teste-debug", s3_key: "fake/16.jpg", s3_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-17", event_slug: "evento-teste-debug", s3_key: "fake/17.jpg", s3_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-18", event_slug: "evento-teste-debug", s3_key: "fake/18.jpg", s3_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-19", event_slug: "evento-teste-debug", s3_key: "fake/19.jpg", s3_url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800", media_type: "general", created_at: new Date().toISOString() },
  { id: "fake-20", event_slug: "evento-teste-debug", s3_key: "fake/20.jpg", s3_url: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800", media_type: "general", created_at: new Date().toISOString() },
];

const FAKE_EVENT: Event = {
  slug: "evento-teste-debug",
  title: "Evento Teste (DEBUG)",
};

export default function UploadMediaForm({
  events,
  onUploaded,
}: UploadMediaFormProps) {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [uploadType, setUploadType] = useState<UploadType>("general");
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedMedia, setLoadedMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [gridCols, setGridCols] = useState(6);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptedFileTypes = useMemo(
    () =>
      uploadType === "videos"
        ? "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
        : "image/jpeg,image/png,image/jpg",
    [uploadType]
  );

  const loadEventMedia = async (slug: string) => {
    if (!slug) {
      setLoadedMedia([]);
      return;
    }

    if (DEBUG_MODE && slug === "evento-teste-debug") {
      console.log("🚧 MODO DEBUG - Carregando 20 mídias fake");
      setLoadingMedia(true);
      setTimeout(() => {
        setLoadedMedia(FAKE_MEDIA);
        setLoadingMedia(false);
      }, 500);
      return;
    }

    setLoadingMedia(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${API_URL}/photos/${slug}/media?media_type=${uploadType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setLoadedMedia(data);
      } else {
        setLoadedMedia([]);
      }
    } catch (err) {
      console.error("Erro ao carregar mídias:", err);
      setLoadedMedia([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Deseja excluir esta mídia?")) return;

    if (DEBUG_MODE) {
      setLoadedMedia((prev) => prev.filter((m) => m.id !== mediaId));
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia(null);
      }
      console.log("🚧 DEBUG: mídia fake removida do estado");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/photos/media/${mediaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLoadedMedia((prev) => prev.filter((m) => m.id !== mediaId));
        if (selectedMedia?.id === mediaId) {
          setSelectedMedia(null);
        }
      } else {
        alert("Erro ao excluir mídia");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao excluir mídia");
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      loadEventMedia(selectedEvent);
    } else {
      setLoadedMedia([]);
    }
  }, [selectedEvent, uploadType]);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setGridCols(6);
      else if (window.innerWidth >= 768) setGridCols(4);
      else setGridCols(2);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMedia) {
        setSelectedMedia(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedMedia]);

  useEffect(() => {
    if (selectedMedia) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedMedia]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!files || files.length === 0 || !selectedEvent) {
      setMessage("❌ Selecione um evento e pelo menos um arquivo.");
      return;
    }

    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setMessage("❌ Token não encontrado.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch(
        `${API_URL}/ingest/${selectedEvent}/media?type=${uploadType}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.detail || "Falha no upload");

      setMessage("✅ Upload concluído com sucesso!");

      onUploaded?.();
      loadEventMedia(selectedEvent);

      if (fileInputRef.current) fileInputRef.current.value = "";
      setFiles(null);
    } catch (err) {
      setMessage(`❌ ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {DEBUG_MODE && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
            <p className="font-bold text-lg">🚧 MODO DEBUG ATIVO</p>
            <p className="text-sm mt-1">
              Usando 20 mídias de exemplo do Unsplash. O backend está offline.
            </p>
            <p className="text-xs mt-2 opacity-75">
              Remova <code className="bg-yellow-200 px-1 rounded">?debug=true</code> da URL para voltar ao modo normal.
            </p>
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium">Evento</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="">Selecione...</option>
            {DEBUG_MODE && (
              <option value={FAKE_EVENT.slug}>{FAKE_EVENT.title}</option>
            )}
            {events.map((ev) => (
              <option key={ev.slug} value={ev.slug}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Tipo de Upload</label>
          <div className="flex gap-4">
            {(["general", "videos"] as UploadType[]).map((type) => (
              <label
                key={type}
                className={`px-3 py-2 border rounded cursor-pointer ${
                  uploadType === type ? "border-blue-600 bg-blue-50" : ""
                }`}
              >
                <input
                  type="radio"
                  className="mr-2"
                  value={type}
                  checked={uploadType === type}
                  onChange={() => {
                    setUploadType(type);
                    setFiles(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
                {type === "general" ? "Fotos" : "Vídeos"}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Arquivos</label>
          <div className="border-dashed border-2 p-6 rounded-md text-center">
            <PhotoIcon className="h-10 w-10 mx-auto text-gray-400" />
            <label className="cursor-pointer text-blue-600 font-semibold">
              Selecione arquivos
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedFileTypes}
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
              />
            </label>
            {files && (
              <p className="mt-2">{files.length} arquivo(s) selecionado(s).</p>
            )}
          </div>
        </div>

        {message && (
          <p
            className={
              message.startsWith("❌") ? "text-red-600" : "text-green-600"
            }
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !files}
          className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-400"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {uploadType === "general" ? "Fotos Gerais" : "Vídeos"} do Evento
          {loadedMedia.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({loadedMedia.length} {loadedMedia.length === 1 ? "item" : "itens"})
            </span>
          )}
        </h3>

        {!selectedEvent ? (
          <p className="text-gray-500 text-sm">
            Selecione um evento para ver as mídias.
          </p>
        ) : loadingMedia ? (
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Carregando mídias...</span>
          </div>
        ) : loadedMedia.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nenhuma {uploadType === "general" ? "foto" : "vídeo"} enviado para este evento.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 overflow-visible">
            {loadedMedia.map((media, index, array) => {
              const isLastInRow = (index + 1) % gridCols === 0 || index === array.length - 1;

              return (
                <div
                  key={media.id}
                  className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-2 group hover:z-50 overflow-visible"
                >
                  <div
                    className={`relative w-full h-24 overflow-visible cursor-pointer
                               transition-transform duration-300 ease-out
                               md:group-hover:scale-[2.0]
                               ${isLastInRow ? "origin-right" : "origin-left"}`}
                    onClick={() => setSelectedMedia(media)}
                  >
                    <img
                      src={media.s3_url}
                      alt="Mídia"
                      className="w-full h-full object-cover rounded-md shadow-sm"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(media.id);
                      }}
                      className="absolute top-1 right-1
                                 bg-red-600 hover:bg-red-700
                                 text-white text-xs p-1.5
                                 rounded-md shadow-lg
                                 opacity-0 group-hover:opacity-100
                                 transition-opacity"
                      title="Excluir mídia"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-2">
                    <p className="text-[10px] text-gray-500">
                      {new Date(media.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMedia.s3_url}
              alt="Mídia ampliada"
              className="w-full h-full max-h-[85vh] object-contain rounded-lg"
            />

            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white
                         text-gray-800 p-2 rounded-full shadow-lg transition-colors"
              title="Fechar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <button
              onClick={() => handleDeleteMedia(selectedMedia.id)}
              className="absolute top-3 left-3 bg-red-600 hover:bg-red-700
                         text-white p-2 rounded-full shadow-lg transition-colors"
              title="Excluir mídia"
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 left-3 right-3 bg-black/60
                            text-white text-sm px-3 py-2 rounded-lg">
              Enviado em: {new Date(selectedMedia.created_at).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
