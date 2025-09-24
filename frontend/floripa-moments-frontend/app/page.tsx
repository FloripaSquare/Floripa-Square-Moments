"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

async function registerUser(data: {
  name: string;
  email: string;
  whatsapp?: string;
  instagram?: string;
  accepted_lgpd: boolean;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.detail || "Erro ao cadastrar usuário");
  }
  return res.json();
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const eventSlug =
    params?.slug || process.env.NEXT_PUBLIC_EVENT_SLUG || "evento-teste";

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    instagram: "",
    accepted_lgpd: false,
  });
  const [selfie, setSelfie] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selfie) {
      setMsg({ text: "Envie ou tire uma selfie antes de continuar.", ok: false });
      return;
    }

    try {
      await registerUser(form);

      const fd = new FormData();
      fd.append("selfie", selfie);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search/${eventSlug}`,
        {
          method: "POST",
          body: fd,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erro ao buscar fotos");

      const data = await res.json();
      localStorage.setItem("search_result", JSON.stringify(data));
      router.push(`/result/${eventSlug}`);
    } catch (err: unknown) {
      if (err instanceof Error) setMsg({ text: err.message, ok: false });
      else setMsg({ text: "Erro inesperado", ok: false });
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Cadastro & Selfie
        </h1>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Digite seu nome"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="(00) 00000-0000"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram
          </label>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            placeholder="@usuario"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Selfie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sua Selfie
          </label>
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={(e) => setSelfie(e.target.files?.[0] || null)}
            className="w-full text-gray-700"
            required
          />
        </div>

        {/* LGPD */}
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            checked={form.accepted_lgpd}
            onChange={(e) =>
              setForm({ ...form, accepted_lgpd: e.target.checked })
            }
            required
            className="accent-blue-600"
          />
          <span className="text-sm">
            Autorizo o uso da minha imagem conforme LGPD
          </span>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Enviar & Buscar Fotos
        </button>

        {msg && (
          <p
            className={`mt-2 text-center text-sm ${
              msg.ok ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg.text}
          </p>
        )}
      </form>
    </main>
  );
}
