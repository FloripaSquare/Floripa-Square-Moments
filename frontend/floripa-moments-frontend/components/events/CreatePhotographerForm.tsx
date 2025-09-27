"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

interface Event {
  slug: string;
  title: string;
}

interface Props {
  events: Event[];
}

export default function CreatePhotographerForm({ events }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    event_slug: events[0]?.slug || "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "PHOTOGRAPHER" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao criar fotógrafo");
      }

      setMsg({ text: "Fotógrafo criado com sucesso!", ok: true });
      setForm({
        name: "",
        email: "",
        password: "",
        event_slug: events[0]?.slug || "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) setMsg({ text: err.message, ok: false });
      else setMsg({ text: "Erro inesperado", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-800 font-medium mb-1" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          type="text"
          placeholder="Digite o nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
          required
        />
      </div>

      <div>
        <label className="block text-gray-800 font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Digite o email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
          required
        />
      </div>

      <div>
        <label
          className="block text-gray-800 font-medium mb-1"
          htmlFor="password"
        >
          Senha
        </label>
        <input
          id="password"
          type="text"
          placeholder="Digite a senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
          required
        />
      </div>

      <div>
        <label className="block text-gray-800 font-medium mb-1" htmlFor="event">
          Evento
        </label>
        <select
          id="event"
          value={form.event_slug}
          onChange={(e) => setForm({ ...form, event_slug: e.target.value })}
          className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
          required
        >
          {events.map((event) => (
            <option key={event.slug} value={event.slug}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white font-semibold transition-colors ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Criando..." : "Criar Fotógrafo"}
      </button>

      {msg && (
        <p
          className={`mt-2 text-center font-medium ${
            msg.ok ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
