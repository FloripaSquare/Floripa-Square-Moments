"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Função para registrar usuário na API
async function registerUser(data: {
  name: string;
  last_name: string;
  email: string;
  password: string;
  whatsapp?: string;
  instagram?: string;
  accepted_lgpd: boolean;
  event_slug: string; // slug enviado junto
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
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug;

  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) {
    throw new Error("Slug não encontrado na URL");
  }

  const [form, setForm] = useState({
    name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    whatsapp: "",
    instagram: "",
    accepted_lgpd: false,
  });

  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  // Máscara para WhatsApp
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);

    let maskedValue = "";
    if (val.length > 0) maskedValue = "(" + val.substring(0, 2);
    if (val.length > 2) maskedValue += ") " + val.substring(2, 7);
    if (val.length > 7) maskedValue += "-" + val.substring(7, 11);

    setForm({ ...form, whatsapp: maskedValue });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      setMsg({ text: "Senhas não conferem", ok: false });
      return;
    }

    setLoading(true);
    setMsg(null);

    const registrationData = {
      name: form.name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      instagram: form.instagram,
      accepted_lgpd: form.accepted_lgpd,
      event_slug: slug,
    };

    try {
      const userData = await registerUser(registrationData);

      if (userData?.token) {
        localStorage.setItem("user_token", userData.token);
        router.push(`/${slug}/selfie`);
      }

      router.push(`/login/${slug}`);
    } catch (err: unknown) {
      if (err instanceof Error) setMsg({ text: err.message, ok: false });
      else setMsg({ text: "Erro inesperado ao cadastrar", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-form.png')" }}
    >
      <form
        className="w-full max-w-sm shadow-2xl rounded-xl p-8 space-y-4 border-2 border-blue-100 bg-blue/50"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Novo Cadastro
        </h1>

        <input
          type="text"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-[rgb(19,0,208)] focus:border-[rgb(19,0,208)] transition duration-150 bg-gray-50 text-gray-900 placeholder-gray-500"
          required
        />

        <input
          type="text"
          placeholder="Sobrenome"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-[rgb(19,0,208)] focus:border-[rgb(19,0,208)] transition duration-150 bg-gray-50 text-gray-900 placeholder-gray-500"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-[rgb(19,0,208)] focus:border-[rgb(19,0,208)] transition duration-150 bg-gray-50 text-gray-900 placeholder-gray-500"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-[rgb(19,0,208)] focus:border-[rgb(19,0,208)] transition duration-150 bg-gray-50 text-gray-900 placeholder-gray-500"
          required
        />

        <input
          type="password"
          placeholder="Confirme a senha"
          value={form.confirm_password}
          onChange={(e) =>
            setForm({ ...form, confirm_password: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-[rgb(19,0,208)] focus:border-[rgb(19,0,208)] transition duration-150 bg-gray-50 text-gray-900 placeholder-gray-500"
          required
        />

        <input
          type="tel"
          placeholder="WhatsApp (DD) 9XXXX-XXXX"
          value={form.whatsapp}
          onChange={handleWhatsappChange}
          maxLength={15}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-[rgb(19,0,208)] focus:border-[rgb(19,0,208)] transition duration-150 bg-gray-50 text-gray-900 placeholder-gray-500"
        />

        <input
          type="text"
          placeholder="Instagram (@seuperfil)"
          value={form.instagram}
          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-[rgb(19,0,208)] focus:border-[rgb(19,0,208)] transition duration-150 bg-gray-50 text-gray-900 placeholder-gray-500"
        />

        <label className="flex items-start space-x-2 pt-2 text-gray-700">
          <input
            type="checkbox"
            checked={form.accepted_lgpd}
            onChange={(e) =>
              setForm({ ...form, accepted_lgpd: e.target.checked })
            }
            required
            className="mt-1 h-4 w-4 text-[rgb(12,212,255)] border-gray-300 rounded focus:ring-[rgb(12,212,255)]"
          />
          <span className="text-xs sm:text-sm leading-tight text-white font-medium">
            Autorizo o uso dos meus dados para fins de comunicação, conforme a
            Política de Privacidade e LGPD.
          </span>
        </label>

        <button
          type="submit"
          className={`w-full text-white py-3 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out border-2 border-white
    ${
      loading
        ? "bg-blue-400 cursor-not-allowed border-white"
        : "bg-[rgb(10,0,127)] hover:bg-[rgb(19,0,208)] active:bg-[rgb(10,0,127)]"
    }`}
          disabled={loading}
        >
          {loading && (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          Finalizar Cadastro
        </button>

        <button
          type="button"
          className="w-full py-3 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out bg-[rgb(12,212,255)] text-[rgb(10,0,127)] hover:bg-[#0CE0FF] active:bg-[#0ABFFF]"
          onClick={() => router.push(`/login/${slug}`)}
        >
          Já tenho cadastro
        </button>

        {msg && (
          <p
            className={`mt-4 text-center text-sm font-medium p-2 rounded ${
              msg.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {msg.text}
          </p>
        )}
      </form>
    </main>
  );
}
