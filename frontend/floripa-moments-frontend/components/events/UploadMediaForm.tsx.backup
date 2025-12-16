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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptedFileTypes = useMemo(
    () =>
      uploadType === "videos"
        ? "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
        : "image/jpeg,image/png,image/jpg",
    [uploadType]
  );

  // Função para carregar mídias do evento
  const loadEventMedia = async (slug: string) => {
    if (!slug) {
      setLoadedMedia([]);
      return;
    }

    setLoadingMedia(true);
    try {
      const token = localStorage.getItem("admin_token");
      // ⚠️ LISTAGEM usa "media_type" (NÃO "type")
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

  // Função para deletar mídia
  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Deseja excluir esta mídia?")) return;

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

  // Carregar mídias quando evento ou tipo muda
  useEffect(() => {
    if (selectedEvent) {
      loadEventMedia(selectedEvent);
    } else {
      setLoadedMedia([]);
    }
  }, [selectedEvent, uploadType]);

  // Bloquear scroll quando modal está aberto
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
        {/* Evento */}
        <div>
          <label className="block mb-1 text-sm font-medium">Evento</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="">Selecione...</option>
            {events.map((ev) => (
              <option key={ev.slug} value={ev.slug}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
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

        {/* Arquivos */}
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

      {/* Seção de Mídias Existentes */}
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {loadedMedia.map((media) => (
              <div
                key={media.id}
                className="relative group cursor-pointer aspect-square"
              >
                <img
                  src={media.s3_url}
                  alt="Mídia"
                  onClick={() => setSelectedMedia(media)}
                  className="w-full h-full object-cover rounded-lg shadow-sm
                             transition-transform duration-300 ease-out
                             group-hover:scale-110 group-hover:shadow-lg group-hover:z-10"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMedia(media.id);
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700
                             text-white p-1.5 rounded-full shadow-lg
                             opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  title="Excluir mídia"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
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

            {/* Botão Fechar */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white
                         text-gray-800 p-2 rounded-full shadow-lg transition-colors"
              title="Fechar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Botão Excluir */}
            <button
              onClick={() => handleDeleteMedia(selectedMedia.id)}
              className="absolute top-3 left-3 bg-red-600 hover:bg-red-700
                         text-white p-2 rounded-full shadow-lg transition-colors"
              title="Excluir mídia"
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            {/* Info da mídia */}
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
