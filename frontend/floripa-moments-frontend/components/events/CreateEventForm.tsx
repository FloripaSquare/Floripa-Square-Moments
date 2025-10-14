/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

// ✅ 1. Interface atualizada com os novos campos
interface NewEvent {
  slug: string;
  title: string;
  privacy_url?: string;
  event_date: string;
  participants_count: number | string; // Aceita string do input, mas será enviado como número
}

interface CreateEventFormProps {
  onCreated: () => void;
}

export default function CreateEventForm({ onCreated }: CreateEventFormProps) {
  // ✅ 2. Estado inicial atualizado
  const [newEvent, setNewEvent] = useState<NewEvent>({
    slug: "",
    title: "",
    privacy_url: "https://www.moments.floripaquare.com.br/privacy-politcs",
    event_date: "",
    participants_count: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

      // ✅ 3. Payload preparado com os novos campos e conversões necessárias
      const payload = {
        ...newEvent,
        // Garante que o valor seja um número ou nulo se o campo estiver vazio
        participants_count: Number(newEvent.participants_count) || null,
        // Garante que o valor seja nulo se a data não for preenchida
        event_date: newEvent.event_date || null,
      };

      const res = await fetch(`${API_URL}/admin/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao criar evento");
      }

      setMessage("✅ Evento criado com sucesso!");
      // ✅ 4. Limpeza do formulário atualizada
      setNewEvent({
        slug: "",
        title: "",
        privacy_url: "https://www.moments.floripaquare.com.br/privacy-politcs",
        event_date: "",
        participants_count: "",
      });
      onCreated();
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

      {/* Visualização da URL para o usuário */}
      <p className="mt-1 text-xs text-gray-500 -mb-3">
        URL de acesso do cliente:
      </p>
      <input
        type="text"
        value={"https://moments.floripaquare.com.br/" + newEvent.slug}
        readOnly
        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm"
      />

      {/* ✅ 5. Novos campos adicionados ao formulário */}
      <div>
        <label
          htmlFor="event_date"
          className="block text-sm font-medium text-gray-700"
        >
          Data do Evento
        </label>
        <input
          id="event_date"
          name="event_date"
          type="date"
          value={newEvent.event_date}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="participants_count"
          className="block text-sm font-medium text-gray-700"
        >
          Nº de Participantes (Estimado)
        </label>
        <input
          id="participants_count"
          name="participants_count"
          type="number"
          value={newEvent.participants_count}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
          placeholder="0"
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
