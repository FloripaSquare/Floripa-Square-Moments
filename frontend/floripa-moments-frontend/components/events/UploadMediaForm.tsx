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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptedFileTypes = useMemo(
    () =>
      uploadType === "videos"
        ? "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
        : "image/jpeg,image/png,image/jpg",
    [uploadType]
  );

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

      if (fileInputRef.current) fileInputRef.current.value = "";
      setFiles(null);
    } catch (err) {
      setMessage(`❌ ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
