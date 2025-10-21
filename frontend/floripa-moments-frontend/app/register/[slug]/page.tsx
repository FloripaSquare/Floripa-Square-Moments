"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";

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
  name: string;
  accentColor: string;
  backgroundImage: string;
  textColor: string;
  checkboxTextColor: string;
  formBg: string;
  borderColor: string;
  primaryButton: string;
  secondaryButton: string;
  linkColor: string;
  linkHoverColor: string;
  isDark?: boolean;
}

const themes: Record<string, Theme> = {
  "floripa-square": {
    name: "Floripa Square",
    accentColor: "#f37021",
    backgroundImage: "url('/base-moments.jpg')",
    textColor: "text-white",
    checkboxTextColor: "white",
    formBg: "",
    borderColor: "border-white/50",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20",
    linkColor: "text-white",
    linkHoverColor: "underline",
    isDark: true,
  },
  default: {
    name: "Floripa Square",
    accentColor: "#f37021",
    backgroundImage: "url('/base-moments.jpg')",
    textColor: "text-white",
    checkboxTextColor: "white",
    formBg: "",
    borderColor: "border-white/50",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20",
    linkColor: "text-white",
    linkHoverColor: "underline",
    isDark: true,
  },
};

// --- Componente Principal ---
export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const theme = themes[slug || "default"] || themes.default;

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

  const [currentIndex, setCurrentIndex] = useState(0);

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

  const inputClass = `w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[${theme.accentColor}] border-gray-400`;

  return (
    <>
      <main
        className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: theme.backgroundImage }}
      >
        <div
          className={`w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl space-y-3 overflow-y-auto max-h-[90vh] ${theme.formBg}`}
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

          {/* Email e Senha */}
          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            required
          />

          <input
            type="password"
            placeholder="Senha *"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
            required
          />

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
            type="text"
            placeholder="WhatsApp (opcional)"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className={inputClass}
          />

          {/* Termo de Consentimento */}
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

            {/* Políticas e Termos personalizáveis */}
            <div className="text-center text-sm space-y-1 pt-3">
              <a
                href={`/${slug}/privacy-politcs`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.linkHoverColor} ${theme.linkColor}`}
              >
                Políticas de Privacidade
              </a>
              <span
                className={theme.isDark ? "text-white/70" : "text-gray-500"}
              >
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
          </div>

          {/* Botões */}
          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg font-semibold shadow-md ${theme.primaryButton}`}
          >
            Finalizar Cadastro
          </button>

          <button
            type="button"
            onClick={() => router.push(`/login/${slug}`)}
            className={`w-full py-2.5 rounded-lg font-semibold shadow-md ${theme.secondaryButton}`}
          >
            Já tenho cadastro
          </button>
        </div>
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
