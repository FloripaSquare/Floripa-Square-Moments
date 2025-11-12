"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { PhotoIcon } from "@heroicons/react/24/solid";

interface Event {
  slug: string;
  title: string;
}

interface UploadPhotosFormProps {
  events: Event[]; // Lista de eventos (para ADMIN)
  userRole: "ADMIN" | "PHOTOGRAPHER";
  eventSlug?: string; // Slug do evento (para fotógrafo)
  uploaderId?: string; // ID do fotógrafo (obrigatório para fotógrafo)
  onUploaded?: () => void;
}

export default function UploadPhotosForm({
  events,
  userRole,
  eventSlug,
  uploaderId,
  onUploaded,
}: UploadPhotosFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Ao montar, se for fotógrafo, define o evento fixo
  useEffect(() => {
    if (userRole === "PHOTOGRAPHER" && eventSlug) {
      setSelectedEvent(eventSlug);
    }
  }, [userRole, eventSlug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    if (e.target.files) setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0 || !selectedEvent) {
      setMessage("❌ Selecione um evento e ao menos uma foto para enviar.");
      return;
    }

    if (userRole === "PHOTOGRAPHER" && !uploaderId) {
      setMessage("❌ ID do fotógrafo ausente.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token =
        userRole === "ADMIN"
          ? localStorage.getItem("admin_token")
          : localStorage.getItem("photographer_token");

      if (!token) throw new Error("Token não encontrado ou expirado");

      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        formData.append("files", file);
      });

      // ✅ Construir URL conforme backend
      const url = new URL(`${API_URL}/uploads/${selectedEvent}/photos`);
      if (uploaderId) url.searchParams.append("uploader_id", uploaderId);

      console.log("➡️ Enviando upload:", {
        url: url.toString(),
        uploaderId,
        selectedEvent,
        files: Array.from(selectedFiles).map((f) => f.name),
        role: userRole,
      });

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const resText = await res.text();
      console.log("⬅️ Resposta do backend:", res.status, resText);

      if (!res.ok) {
        let errorMessage = "Erro ao enviar fotos";
        try {
          const errorData = JSON.parse(resText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = resText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setMessage("✅ Foto(s) enviada(s) com sucesso!");
      setSelectedFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onUploaded?.();
    } catch (err: unknown) {
      console.error("❌ Erro no upload:", err);
      if (err instanceof Error) setMessage(`❌ ${err.message}`);
      else setMessage(`❌ Erro desconhecido: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {/* Se for ADMIN, pode escolher o evento */}
      {userRole === "ADMIN" && (
        <div>
          <label
            htmlFor="event-select"
            className="block text-sm font-medium text-gray-700"
          >
            Selecione o Evento
          </label>
          <select
            id="event-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            disabled={loading}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              -- Escolha um evento --
            </option>
            {events.map((event) => (
              <option key={event.slug} value={event.slug}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Se for FOTÓGRAFO, mostra evento fixo */}
      {userRole === "PHOTOGRAPHER" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Evento associado
          </label>
          <p className="mt-1 text-sm text-gray-900 font-semibold">
            {selectedEvent || "Nenhum evento associado"}
          </p>
        </div>
      )}

      {/* Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fotos para Upload
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            <PhotoIcon
              className="mx-auto h-12 w-12 text-gray-300"
              aria-hidden="true"
            />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                <span>Clique para enviar</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">ou arraste e solte</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, GIF até 10MB
            </p>
          </div>
        </div>
      </div>

      {selectedFiles && selectedFiles.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-semibold">
            {selectedFiles.length} arquivo(s) selecionado(s):
          </p>
          <ul className="list-disc list-inside">
            {Array.from(selectedFiles).map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

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
        className="w-full flex justify-center items-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Enviando...
          </>
        ) : (
          "Enviar Fotos"
        )}
      </button>
    </form>
  );
}
