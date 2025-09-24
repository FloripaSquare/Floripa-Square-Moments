/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

interface NewEvent {
  slug: string;
  title: string;
  privacy_url?: string;
}

interface CreateEventFormProps {
  onCreated: () => void;
}

export default function CreateEventForm({ onCreated }: CreateEventFormProps) {
  const [newEvent, setNewEvent] = useState<NewEvent>({
    slug: "",
    title: "",
    privacy_url: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Para o slug, removemos espaços e caracteres especiais automaticamente
    const finalValue =
      name === "slug"
        ? value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : value;
    setNewEvent((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Token não encontrado");

      // ROTA CORRIGIDA: Removido o prefixo /v1 e ajustado para /admin/events
      const res = await fetch(`${API_URL}/admin/events/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao criar evento");
      }

      setMessage("✅ Evento criado com sucesso!");
      setNewEvent({ slug: "", title: "", privacy_url: "" }); // Limpa o formulário
      onCreated(); // Atualiza a lista de eventos no painel
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Título do Evento
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={newEvent.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Casamento João e Maria"
        />
      </div>
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug (URL amigável)
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={newEvent.slug}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: casamento-joao-e-maria"
        />
      </div>
      <div>
        <label
          htmlFor="privacy_url"
          className="block text-sm font-medium text-gray-700"
        >
          URL da Política de Privacidade (Opcional)
        </label>
        <input
          id="privacy_url"
          name="privacy_url"
          type="url"
          value={newEvent.privacy_url}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://seusite.com/privacidade"
        />
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
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Criando..." : "Criar Evento"}
      </button>
    </form>
  );
}
