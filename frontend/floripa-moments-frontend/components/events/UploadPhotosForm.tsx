/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { PhotoIcon } from "@heroicons/react/24/solid";

interface Event {
  slug: string;
  title: string;
}

interface UploadPhotosFormProps {
  events: Event[];
  onUploaded?: () => void;
}

export default function UploadPhotosForm({
  events,
  onUploaded,
}: UploadPhotosFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(""); // Limpa a mensagem ao selecionar novos arquivos
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0 || !selectedEvent) {
      setMessage("❌ Selecione um evento e ao menos uma foto para enviar.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Token não encontrado");

      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) =>
        formData.append("files", file)
      );

      // Rota de ingestão de fotos por evento
      const res = await fetch(`${API_URL}/uploads/${selectedEvent}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao enviar fotos");
      }

      const data = await res.json();
      setMessage(
        `✅ ${data.uploaded_keys.length} foto(s) enviada(s) com sucesso!`
      );

      // Limpa o formulário após o sucesso
      setSelectedFiles(null);
      setSelectedEvent(events[0]?.slug || "");
      if (document.getElementById("file-upload")) {
        (document.getElementById("file-upload") as HTMLInputElement).value = "";
      }

      onUploaded?.();
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
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
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
              >
                <span>Clique para enviar</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
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
