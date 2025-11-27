"use client";

import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

type Theme = {
  backgroundImage: string;
  primaryButtonClasses: string;
  ghostButtonClasses: string;
  registerButtonMarginClasses: string;
  textColor: string;
  logo: string;
  contentClasses: string;
};

const themes: Record<string, Theme> = {
  fs: {
    backgroundImage: 'url("rooftop/login-moments.png")',
    primaryButtonClasses: "text-[#ffff]",

    ghostButtonClasses: "text-[#ffff]",

    textColor: "text-white",
    logo: "/logos/fs-logo.png",
    registerButtonMarginClasses: "mb-11",
    // 🔑 MUDANÇA AQUI: Alinha o bloco todo ao final, e pb-10 (2.5rem) o empurra para cima.
    contentClasses: "justify-end pb-63",
  },

  kotai: {
    backgroundImage: "url('/kotai/login-kotai.png')",
    primaryButtonClasses: "text-[#ffff]",
    ghostButtonClasses: "text-[#ffff]",
    textColor: "text-[#f2f2f3]",
    logo: "/kotai/logo-kotai.png",
    registerButtonMarginClasses: "mb-11",
    // 🔑 MUDANÇA AQUI: Alinha o bloco todo ao final, e pb-10 (2.5rem) o empurra para cima.
    contentClasses: "justify-end pb-63",
  },
  aegea: {
    backgroundImage: "url('/aegea/login-aegea.png')",
    primaryButtonClasses: "text-[#ffff]",
    ghostButtonClasses: " text-[#ffff]",
    textColor: "text-[#f2f2f3]",
    logo: "/aegea/logo-aegea.png",
    // Ajustado para dar um respiro entre Cadastrar e Login
    registerButtonMarginClasses: "mb-11",
    // 🔑 MUDANÇA AQUI: Alinha o bloco todo ao final, e pb-10 (2.5rem) o empurra para cima.
    contentClasses: "justify-end pb-63",
  },
  default: {
    backgroundImage: 'url("rooftop/login-moments.png")',
    primaryButtonClasses: "text-[#ffff]",
    ghostButtonClasses: "text-[#ffff]",
    textColor: "text-white",
    logo: "/logos/fs-logo.png",
    registerButtonMarginClasses: "mb-11",
    // 🔑 MUDANÇA AQUI: Alinha o bloco todo ao final, e pb-10 (2.5rem) o empurra para cima.
    contentClasses: "justify-end pb-63",
  },
};

export default function SlugPage() {
  const router = useRouter();
  const params = useParams();
  let slug = params?.["slug"] as string;

  if (slug === undefined) {
    slug = "fs";
  }

  const theme = (slug && themes[slug]) || themes.default;

  const baseButtonClasses =
    "w-full max-w-xs px-4 py-3 rounded-md font-semibold uppercase text-center transition duration-300 ease-in-out";

  return (
    <main className={`relative w-full h-screen ${theme.textColor}`}>
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: theme.backgroundImage }}
      />

      {/* 1. CONTEÚDO EXTERNO */}
      <div
        className={`pt-20 relative z-10 flex flex-col items-center w-full h-full text-center ${theme.contentClasses}`}
      >
        {/* 2. CONTEÚDO INTERNO: Bloco de Botões */}
        <div className="flex flex-col items-center">
          <button
            className={`${baseButtonClasses} ${theme.ghostButtonClasses} ${theme.registerButtonMarginClasses}`}
            onClick={() => router.push(`/register/${slug}`)}
          >
            Cadastrar
          </button>

          <button
            className={`${baseButtonClasses} ${theme.primaryButtonClasses}`}
            onClick={() => router.push(`/login/${slug}`)}
          >
            Login
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
