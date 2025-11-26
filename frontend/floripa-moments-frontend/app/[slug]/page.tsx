"use client";

import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

// 🔥 1. Interface + propriedade de logo
type Theme = {
  backgroundImage: string;
  primaryButtonClasses: string;
  ghostButtonClasses: string;
  textColor: string;
  logo: string; // <= LOGO DINÂMICA
};

const themes: Record<string, Theme> = {
  fs: {
    backgroundImage: 'url("/bg-moments.jpg")',
    primaryButtonClasses:
      "bg-white text-orange-600 font-bold hover:bg-gray-200",
    ghostButtonClasses:
      "border-2 border-white text-white hover:bg-white hover:text-orange-600",
    textColor: "text-white",
    logo: "/logos/fs-logo.png", // <= coloque sua logo
  },

  kotai: {
    backgroundImage: "url('/kotai/fundo-kotai.jpg')",
    // BOTÃO PRINCIPAL — verde da paleta (#00fe91)
    primaryButtonClasses:
      "bg-[#00fe91] text-[#0a0a0a] font-bold hover:bg-[#05e184]",

    // BOTÃO GHOST — borda azul da paleta (#67b7ff) + texto azul
    ghostButtonClasses:
      "border-2 border-[#67b7ff] text-[#67b7ff] hover:bg-[#67b7ff] hover:text-[#0a0a0a]",

    // COR DO TEXTO — branco gelo da paleta (#f2f2f3)
    textColor: "text-[#f2f2f3]",

    // LOGO
    logo: "/kotai/logo-kotai.png",
  },
  aegea: {
    backgroundImage: "url('/aegea/fundo-aegea.jpg')",
    // BOTÃO PRINCIPAL — verde da paleta (#00fe91)
    primaryButtonClasses:
      "bg-[#00fe91] text-[#0a0a0a] font-bold hover:bg-[#05e184]",

    // BOTÃO GHOST — borda azul da paleta (#67b7ff) + texto azul
    ghostButtonClasses:
      "border-2 border-[#67b7ff] text-[#67b7ff] hover:bg-[#67b7ff] hover:text-[#0a0a0a]",

    // COR DO TEXTO — branco gelo da paleta (#f2f2f3)
    textColor: "text-[#f2f2f3]",

    // LOGO
    logo: "/aegea/logo-aegea.png",
  },
  default: {
    backgroundImage: 'url("/bg-helisul.png")',
    primaryButtonClasses:
      "bg-cyan-400 text-blue-900 font-bold hover:bg-cyan-500",
    ghostButtonClasses:
      "border-2 border-white text-white hover:bg-white hover:text-blue-900",
    textColor: "text-white",
    logo: "/logos/default-logo.png", // <= coloque sua logo
  },
};

export default function SlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.["slug"] as string;

  const theme = (slug && themes[slug]) || themes.default;

  const baseButtonClasses =
    "w-full max-w-xs px-4 py-3 rounded-md font-semibold uppercase text-center transition duration-300 ease-in-out shadow-lg";

  return (
    <main className={`relative w-full h-screen ${theme.textColor}`}>
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: theme.backgroundImage }}
      />

      {/* CONTEÚDO */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-6 gap-6">
        {/* 🔥 LOGO DINÂMICA */}
        <Image
          src={theme.logo}
          alt="Logo do evento"
          width={180}
          height={180}
          priority
          className="mb-2 drop-shadow-xl"
        />

        {/* BOTÕES */}
        <button
          className={`${baseButtonClasses} ${theme.ghostButtonClasses}`}
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

      <Footer />
    </main>
  );
}
