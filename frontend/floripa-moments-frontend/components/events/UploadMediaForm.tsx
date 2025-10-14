"use client";

import { useState, useMemo, useRef } from "react";
import { API_URL } from "@/lib/api";
import { PhotoIcon } from "@heroicons/react/24/outline";

type UploadType = "general" | "videos";

interface Event {
  slug: string;
  title: string;
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

  const fileInputRef = useRef<HTMLInputElement | null>(null); // ✅ ref única

  const acceptedFileTypes = useMemo(() => {
    if (uploadType === "videos")
      return "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska";
    return "image/jpeg,image/png,image/jpg";
  }, [uploadType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !selectedEvent) {
      setMessage("❌ Por favor, selecione um evento e ao menos um arquivo.");
      return;
    }
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Token de admin não encontrado.");

      const endpoint = `${API_URL}/ingest/${selectedEvent}/media?type=${uploadType}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || "Falha no upload.");
      }

      setMessage(`✅ ${result.message || "Arquivos enviados com sucesso!"}`);
      if (onUploaded) onUploaded();
      if (fileInputRef.current) fileInputRef.current.value = ""; // ✅ limpa input
      setFiles(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage(`❌ Erro desconhecido: ${String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="event-select"
          className="block text-sm font-medium text-gray-700"
        >
          Evento
        </label>
        <select
          id="event-select"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          required
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
            selectedEvent ? "text-gray-900" : "text-gray-500"
          }`}
        >
          <option value="">Selecione um evento...</option>
          {events.map((event) => (
            <option key={event.slug} value={event.slug}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Mídia
        </label>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {(["general", "videos"] as UploadType[]).map((type) => (
            <label
              key={type}
              className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all ${
                uploadType === type
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="uploadType"
                value={type}
                checked={uploadType === type}
                onChange={() => {
                  setUploadType(type);
                  setFiles(null);
                  if (fileInputRef.current) fileInputRef.current.value = ""; // ✅ limpa input
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                {type === "general" ? "Fotos Gerais" : "Vídeos"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700"
        >
          Arquivos
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                <span>Selecione os arquivos</span>
                <input
                  ref={fileInputRef} // ✅ ref única
                  type="file"
                  className="sr-only"
                  multiple
                  accept={acceptedFileTypes}
                  onChange={(e) => setFiles(e.target.files)}
                />
              </label>
              <p className="pl-1">ou arraste e solte aqui</p>
            </div>
            <p className="text-xs text-gray-500">
              {uploadType === "videos"
                ? "Vídeos em MP4, MOV, etc."
                : "Imagens em JPG, PNG"}
            </p>
            {files && (
              <p className="text-sm font-semibold text-blue-700 mt-2">
                {files.length} arquivo(s) selecionado(s).
              </p>
            )}
          </div>
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !files || files.length === 0}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading
          ? "Enviando..."
          : `Enviar ${uploadType === "videos" ? "Vídeos" : "Fotos Gerais"}`}
      </button>
    </form>
  );
}
