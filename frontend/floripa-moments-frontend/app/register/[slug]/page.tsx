"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";

interface FormData {
  name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  whatsapp: string;
  instagram: string;
  accepted_lgpd: boolean;
  biometric_acceptance: boolean;
  international_transfer_data: boolean;
  image_usage_portifolio: boolean;
  marketing_communication_usage: boolean;
  age_declaration: boolean;
  responsible_consent: boolean;
}

interface ConsentItem {
  key: keyof FormData;
  title: string;
  description?: string;
  required?: boolean;
}

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const isFloripaSquare = slug === "floripa-square";

  const [form, setForm] = useState<FormData>({
    name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    whatsapp: "",
    instagram: "",
    accepted_lgpd: false,
    biometric_acceptance: false,
    international_transfer_data: false,
    image_usage_portifolio: false,
    marketing_communication_usage: false,
    age_declaration: false,
    responsible_consent: false,
  });

  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const consentItems: ConsentItem[] = [
    {
      key: "biometric_acceptance",
      title: "Consentimento Biométrico",
      description:
        "Autorizo o uso da minha selfie apenas para localização de fotos, sem armazenamento permanente.",
      required: true,
    },
    {
      key: "international_transfer_data",
      title: "Transferência Internacional",
      description:
        "Autorizo a transferência dos meus dados para servidores nos EUA (AWS).",
      required: true,
    },
    {
      key: "image_usage_portifolio",
      title: "Uso de Imagem",
      description:
        "Autorizo o uso das fotos do evento em portfólio e divulgação institucional.",
    },
    {
      key: "marketing_communication_usage",
      title: "Marketing",
      description:
        "Desejo receber comunicações e novidades do Rooftop Floripa Square.",
    },
    {
      key: "age_declaration",
      title: "Declaro que tenho 18 anos ou mais",
      required: true,
    },
    {
      key: "responsible_consent",
      title: "Consentimento do responsável legal",
      description:
        "Caso seja responsável legal de adolescente (12-17 anos), declaro que consinto com o uso.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    const totalItems = form.age_declaration
      ? consentItems.length - 1
      : consentItems.length;
    setCurrentIndex((prev) => (prev < totalItems - 2 ? prev + 1 : prev));
  };

  const handleCheckboxChange = (key: keyof FormData) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
    if (currentIndex < consentItems.length - 2) handleNext();
  };

  const handleDotClick = (index: number) => setCurrentIndex(index);

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

    try {
      setLoading(true);
      setMsg(null);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event_slug: slug }),
      });

      if (!res.ok) throw new Error("Erro ao cadastrar usuário");

      const userData = await res.json();
      if (userData?.token) {
        localStorage.setItem("user_token", userData.token);
        router.push(`/${slug}/selfie`);
      } else {
        router.push(`/login/${slug}`);
      }
    } catch (err: unknown) {
      setMsg({
        text:
          err instanceof Error ? err.message : "Erro inesperado ao cadastrar",
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isFloripaSquare ? "#f37021" : "#1d4ed8";

  const inputClass = `w-full px-4 py-3 border border-gray-400 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[${accentColor}]`;

  const visibleItems = () => {
    const orderedItems = [
      consentItems[0],
      consentItems[1],
      consentItems[2],
      consentItems[3],
      consentItems[4],
      ...(form.age_declaration ? [] : [consentItems[5]]),
    ];
    if (currentIndex >= orderedItems.length - 2) return orderedItems.slice(-2);
    return [orderedItems[currentIndex]];
  };

  const progressDots = () => {
    const orderedItems = [
      consentItems[0],
      consentItems[1],
      consentItems[2],
      consentItems[3],
      consentItems[4],
      ...(form.age_declaration ? [] : [consentItems[5]]),
    ];
    return orderedItems.map((item, idx) => (
      <button
        key={idx}
        type="button"
        onClick={() => handleDotClick(idx)}
        className={`w-4 h-4 rounded-full transition-colors duration-200 focus:outline-none ${
          form[item.key] ? `bg-[${accentColor}]` : "bg-gray-300"
        }`}
      />
    ));
  };

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
        style={{
          backgroundImage: isFloripaSquare
            ? "url('/bg-form-moments.png')"
            : "url('/bg-form.png')",
        }}
      >
        <form
          className={`w-full max-w-md shadow-2xl rounded-xl p-8 space-y-4 border-2 overflow-y-auto overflow-y-auto scrollbar-hide
            ${
              isFloripaSquare
                ? "border-none text-white"
                : "border-blue-100 bg-white/90 text-gray-900"
            }`}
          onSubmit={handleSubmit}
        >
          <h1
            className={`text-3xl font-extrabold text-center mb-6 ${
              isFloripaSquare ? "text-[#ffff]" : "text-blue-800"
            }`}
          >
            Novo Cadastro
          </h1>

          {/* Inputs principais */}
          <input
            type="text"
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            required
          />
          <input
            type="text"
            placeholder="Sobrenome"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className={inputClass}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Confirme a senha"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
            className={inputClass}
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp"
            value={form.whatsapp}
            onChange={handleWhatsappChange}
            maxLength={15}
            className={inputClass}
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              @
            </span>
            <input
              type="text"
              placeholder="seuperfil"
              value={form.instagram.replace(/^@/, "")}
              onChange={(e) =>
                setForm({
                  ...form,
                  instagram: "@" + e.target.value.replace(/^@/, ""),
                })
              }
              className={`${inputClass} pl-7`}
            />
          </div>

          {/* Carrossel de consentimento */}
          <div
            className={`p-4 rounded-lg border text-sm space-y-4 ${
              isFloripaSquare
                ? "border-[#ffff]/50 bg-white/10 text-white"
                : "border-blue-200 bg-blue-50 text-gray-900"
            }`}
          >
            <h2
              className={`text-base font-bold text-center ${
                isFloripaSquare ? "text-[#ffffff]" : "text-blue-900"
              }`}
            >
              Termo de Consentimento - Plataforma “Moments”
            </h2>

            {visibleItems().map((item) => (
              <Checkbox
                key={item.key}
                checked={!!form[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
                title={item.title}
                description={item.description}
                required={item.required}
                accentColor={"#ffff"}
              />
            ))}

            <div className="flex justify-center gap-2 mt-3">
              {progressDots()}
            </div>
          </div>

          <a
            href={`/${slug}/privacy-politcs`}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center text-sm mb-2 underline ${
              isFloripaSquare ? "text-[#ffff]" : "text-blue-700"
            }`}
          >
            Políticas de Privacidade
          </a>
          <a
            href={`/${slug}/terms`}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center text-sm mb-2 underline ${
              isFloripaSquare ? "text-[#ffff]" : "text-blue-700"
            }`}
          >
            Termos e Condições de Uso
          </a>

          <button
            type="submit"
            className={`w-full text-white py-3 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out ${
              isFloripaSquare
                ? "bg-[#f37021] hover:bg-[#d35e1d]"
                : "bg-blue-700 hover:bg-blue-800"
            } disabled:opacity-60`}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Finalizar Cadastro"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/login/${slug}`)}
            className={`w-full py-3 rounded-lg font-semibold shadow-md ${
              isFloripaSquare
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            Já tenho cadastro
          </button>

          {msg && (
            <p
              className={`mt-2 text-center text-sm font-medium p-2 rounded ${
                msg.ok
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {msg.text}
            </p>
          )}
        </form>
      </main>
      <Footer />
    </>
  );
}

function Checkbox({
  checked,
  onChange,
  title,
  description,
  required = false,
  accentColor = "#1d4ed8",
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  required?: boolean;
  accentColor?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 rounded border-gray-400"
        style={{ accentColor }}
        required={required}
      />
      <div className="leading-snug">
        <span className="block font-semibold" style={{ color: accentColor }}>
          {title}
        </span>
        {description && (
          <span className="text-sm opacity-90 block">{description}</span>
        )}
      </div>
    </label>
  );
}
