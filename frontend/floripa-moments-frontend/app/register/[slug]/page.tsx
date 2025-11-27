"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";

// --- Interfaces e Tipos ---
interface FormData {
  name: string;
  last_name: string;
  email: string;
  password: string;
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

// --- Tema ---
interface Theme {
  accentColor: string;
  backgroundImage: string;
  textColor: string;
  borderColor: string;
  primaryButton: string;
  secondaryButton: string;
  linkColor: string;
  linkHoverColor: string;
  isDark?: boolean;
}

const themes: Record<string, Theme> = {
  fs: {
    accentColor: "#f37021",
    backgroundImage: "url('/rooftop/base-moments.png')",
    textColor: "text-white",
    borderColor: "border-white/50",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20",
    linkColor: "text-white",
    linkHoverColor: "underline",
    isDark: true,
  },
  kotai: {
    accentColor: "#00fe91",
    backgroundImage: "url('/kotai/fundo-kotai.png')",
    textColor: "text-[#f2f2f3]",
    borderColor: "border-[#67b7ff]/50",
    primaryButton: "bg-[#00fe91] text-black hover:bg-[#05e184]",
    secondaryButton: "bg-white/10 text-[#f2f2f3] hover:bg-white/20",
    linkColor: "text-[#67b7ff]",
    linkHoverColor: "underline",
    isDark: true,
  },
  aegea: {
    accentColor: "#00fe91",
    backgroundImage: "url('/aegea/fundo-aegea.png')",
    textColor: "text-[#f2f2f3]",
    borderColor: "border-[#67b7ff]/50",
    primaryButton: "bg-[#00fe91] text-black hover:bg-[#05e184]",
    secondaryButton: "bg-white/10 text-[#f2f2f3] hover:bg-white/20",
    linkColor: "text-[#67b7ff]",
    linkHoverColor: "underline",
    isDark: true,
  },
  default: {
    accentColor: "#1d4ed8",
    backgroundImage: "url('/bg-form.png')",
    textColor: "text-gray-900",
    borderColor: "border-blue-100",
    primaryButton: "bg-blue-700 hover:bg-blue-800 text-white",
    secondaryButton: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    linkColor: "text-blue-700",
    linkHoverColor: "underline",
    isDark: false,
  },
};

// --- Componente Principal ---
export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const theme = themes[slug || "default"];

  const [form, setForm] = useState<FormData>({
    name: "",
    last_name: "",
    email: "",
    password: "",
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
  const [showPassword, setShowPassword] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- Consentimentos ---
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
      description: "Desejo receber comunicações e novidades do evento.",
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
        onClick={() => setCurrentIndex(idx)}
        className="w-3 h-3 rounded-full transition-colors duration-200"
        style={{
          backgroundColor: form[item.key]
            ? theme.accentColor
            : "rgba(255,255,255,0.3)",
        }}
      />
    ));
  };

  // --- Máscara WhatsApp ---
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);

    let maskedValue = "";
    if (val.length > 0) maskedValue = "(" + val.substring(0, 2);
    if (val.length > 2) maskedValue += ") " + val.substring(2, 7);
    if (val.length > 7) maskedValue += "-" + val.substring(7, 11);

    setForm({ ...form, whatsapp: maskedValue });
  };

  // --- Envio do formulário ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredConsents: (keyof FormData)[] = consentItems
      .filter((item) => item.required)
      .map((item) => item.key);

    for (const key of requiredConsents) {
      if (!form[key]) {
        const consentTitle =
          consentItems.find((c) => c.key === key)?.title ||
          "um termo obrigatório";
        setMsg({
          text: `O consentimento "${consentTitle}" é obrigatório.`,
          ok: false,
        });
        return;
      }
    }

    try {
      setLoading(true);
      setMsg(null);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event_slug: slug }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.detail || "Erro ao cadastrar usuário");
      }

      if (responseData?.token) {
        localStorage.setItem("user_token", responseData.token);
        router.push(`/${slug}/selfie`);
      } else {
        setMsg({
          text: "Cadastro realizado com sucesso! Faça o login.",
          ok: true,
        });
        setTimeout(() => router.push(`/login/${slug}`), 2000);
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

  const inputClass = `w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[${theme.accentColor}] border-gray-400`;

  return (
    <>
      <main
        className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: theme.backgroundImage }}
      >
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl space-y-3 overflow-y-auto max-h-[90vh]
          }`}
        >
          <h1
            className={`text-3xl font-extrabold text-center mb-4 ${theme.textColor}`}
          >
            Novo Cadastro
          </h1>

          {/* Nome e Sobrenome */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
            <input
              type="text"
              placeholder="Sobrenome *"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            required
          />

          {/* Senha  */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha *"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${inputClass} pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Instagram e WhatsApp */}
          <input
            type="text"
            placeholder="Instagram *"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className={inputClass}
            required
          />

          <input
            type="tel"
            placeholder="WhatsApp (opcional)"
            value={form.whatsapp}
            onChange={handleWhatsappChange}
            className={inputClass}
          />

          {/* Termos */}
          <div
            className={`p-3 rounded-lg border text-sm space-y-3 ${theme.borderColor}`}
          >
            <h2
              className={`text-base font-bold text-center ${theme.textColor}`}
            >
              Termo de Consentimento
            </h2>
            {visibleItems().map((item) => (
              <Checkbox
                key={item.key}
                checked={!!form[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
                title={item.title}
                description={item.description}
                required={item.required}
                accentColor={theme.accentColor}
                textColor={theme.isDark ? "white" : "black"}
              />
            ))}
            <div className="flex justify-center gap-2 pt-1">
              {progressDots()}
            </div>
          </div>

          {/* Links */}
          <div className="text-center text-sm space-y-1 pt-3">
            <a
              href={`/${slug}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.linkHoverColor} ${theme.linkColor}`}
            >
              Políticas de Privacidade
            </a>
            <span className={theme.isDark ? "text-white/70" : "text-gray-500"}>
              {" "}
              |{" "}
            </span>
            <a
              href={`/${slug}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.linkHoverColor} ${theme.linkColor}`}
            >
              Termos e Condições de Uso
            </a>
          </div>

          {/* Botões */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold shadow-md ${theme.primaryButton} disabled:opacity-60`}
          >
            {loading ? "Enviando..." : "Finalizar Cadastro"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/login/${slug}`)}
            className={`w-full py-2.5 rounded-lg font-semibold shadow-md ${theme.secondaryButton}`}
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

// --- Componente Checkbox ---
function Checkbox({
  checked,
  onChange,
  title,
  description,
  required = false,
  accentColor = "#1d4ed8",
  textColor = "white",
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  required?: boolean;
  accentColor?: string;
  textColor?: string;
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
      <div className="leading-snug text-sm" style={{ color: textColor }}>
        <span className="block font-semibold" style={{ color: accentColor }}>
          {title}
        </span>
        {description && <span className="opacity-90 block">{description}</span>}
      </div>
    </label>
  );
}
