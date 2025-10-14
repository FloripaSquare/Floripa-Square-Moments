// Salve em: /components/admin/EditEventModal.tsx
"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

// A interface do evento completo, como vem da API
interface Event {
  slug: string;
  title: string;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  participants_count?: number | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onUpdated: () => void; // Para recarregar os dados do dashboard
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  onUpdated,
}: Props) {
  const [formData, setFormData] = useState({
    start_time: "",
    end_time: "",
    // Adicione outros campos que você queira editar aqui, como title, etc.
  });
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Popula o formulário quando o evento é carregado
  useEffect(() => {
    if (event) {
      setFormData({
        start_time: event.start_time?.slice(0, 5) || "",
        end_time: event.end_time?.slice(0, 5) || "",
      });
    }
  }, [event]);

  // Calcula a duração automaticamente
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`1970-01-01T${formData.start_time}`);
      const end = new Date(`1970-01-01T${formData.end_time}`);
      const diffMs = end.getTime() - start.getTime();
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        setDuration(`${hours}h ${minutes}min`);
      } else {
        setDuration("");
      }
    }
  }, [formData.start_time, formData.end_time]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/events/${event.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
        }),
      });

      if (!res.ok) throw new Error("Falha ao atualizar o evento");

      setMessage("✅ Horários salvos com sucesso!");
      onUpdated(); // Recarrega o dashboard
      setTimeout(() => onClose(), 1500); // Fecha o modal após sucesso
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage(`❌ Erro desconhecido`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Definir Horário - {event.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start_time"
                className="block text-sm font-medium text-gray-700"
              >
                Horário de Início
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="end_time"
                className="block text-sm font-medium text-gray-700"
              >
                Horário de Fim
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>

          {duration && (
            <p className="text-sm text-gray-600">
              Duração: <span className="font-semibold">{duration}</span>
            </p>
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
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Horários"}
          </button>
        </form>
      </div>
    </div>
  );
}
