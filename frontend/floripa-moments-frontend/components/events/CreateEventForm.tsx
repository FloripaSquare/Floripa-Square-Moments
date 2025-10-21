/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

// Defina o URL da sua API aqui, idealmente a partir de variáveis de ambiente.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.moments-floripasquare.com.br";

// ✅ CORREÇÃO 1: A interface foi simplificada.
// 'privacy_url' foi removido, pois é um valor derivado do 'slug' e não um estado.
interface NewEvent {
  slug: string;
  title: string;
  event_date: string;
  participants_count: number | string; // Aceita string do input, mas será enviado como número
}

interface CreateEventFormProps {
  onCreated: () => void;
}

export default function CreateEventForm({ onCreated }: CreateEventFormProps) {
  // ✅ CORREÇÃO 2: O estado inicial agora reflete a nova interface, sem 'privacy_url'.
  const [newEvent, setNewEvent] = useState<NewEvent>({
    slug: "",
    title: "",
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

      // --- INÍCIO DAS CORREÇÕES PRINCIPAIS ---

      // ✅ CORREÇÃO 3: 'privacy_url' é construída dinamicamente aqui, no momento do envio.
      // Isso garante que ela sempre corresponda ao 'slug' e seja uma URL válida ou null.
      const constructedPrivacyUrl = newEvent.slug
        ? `https://moments.floripasquare.com.br/${newEvent.slug}/privacy`
        : null;

      // ✅ CORREÇÃO 4: A lógica para 'participants_count' foi ajustada.
      // Agora, uma string vazia ("") se torna 'null', mas o número 0 é preservado corretamente.
      const participantsCount =
        newEvent.participants_count === ""
          ? null
          : Number(newEvent.participants_count);

      // ✅ CORREÇÃO 5: O payload final é montado com os valores corrigidos e formatados.
      const payload = {
        slug: newEvent.slug,
        title: newEvent.title,
        event_date: newEvent.event_date || null, // Garante que uma data vazia se torne null
        privacy_url: constructedPrivacyUrl,
        participants_count: participantsCount,
      };

      // --- FIM DAS CORREÇÕES PRINCIPAIS ---

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
        // Melhora a exibição de erros de validação do FastAPI
        let detailedMessage = errorData.detail;
        if (Array.isArray(errorData.detail)) {
          detailedMessage = errorData.detail
            .map((err: any) => `${err.loc.slice(-1)}: ${err.msg}`)
            .join("; ");
        }
        throw new Error(detailedMessage || "Erro ao criar evento");
      }

      setMessage("✅ Evento criado com sucesso!");

      // ✅ CORREÇÃO 6: A limpeza do formulário agora corresponde ao estado simplificado.
      setNewEvent({
        slug: "",
        title: "",
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
        value={"moments.floripasquare.com.br/" + newEvent.slug}
        readOnly
        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm"
      />

      {/* Novos campos adicionados ao formulário */}
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
