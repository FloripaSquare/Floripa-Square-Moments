"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import FeedbackPopup from "../comments/page";
import Footer from "@/components/Footer";

type Theme = {
  backgroundImage?: string;
  textColor: string;
  primaryButton: string;
  secondaryButton: string;
  ghostButton: string;
  tertiaryButton: string;

  text: string; // 🔥 PROPRIEDADE ÚNICA DE TEXTO
};

const themes: Record<string, Theme> = {
  fs: {
    backgroundImage: "url('/base-moments.png')",
    textColor: "text-white",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white w-80",
    secondaryButton: " bg-[#C65C3C] hover:bg-[#A94C16] text-white w-80",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-[#f37021] w-80",
    tertiaryButton: "bg-white/10 text-white hover:bg-white/20 w-80",

    text: `Olá, que bom que você está no Rooftop!
Esta é a sua galeria oficial de fotos no evento.
Para começar, tire uma selfie e depois clique no botão ENVIAR & BUSCAR FOTOS.`,
  },

  kotai: {
    backgroundImage: "url('/kotai/fundo-kotai.png')",
    textColor: "text-white",
    primaryButton: "bg-[#0084ff] hover:bg-[#006cd1] text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20 w-80",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-[#0084ff]",
    tertiaryButton: "bg-white/10 text-white hover:bg-white/20 w-80",

    text: `Olá que bom que você está no Kotai Summit!

Esta é a sua galeria oficial de fotos no evento. Compartilhe momentos incríveis em suas redes sociais.

Para começar, tire uma selfie e depois clique no botão ENVIAR & BUSCAR FOTOS.`,
  },

  aegea: {
    backgroundImage: "url('/aegea/fundo-aegea.png')",
    textColor: "text-white",
    primaryButton: "bg-[#0084ff] hover:bg-[#006cd1] text-white w-70",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20 w-70",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-[#0084ff]",
    tertiaryButton: "bg-white/10 text-white hover:bg-white/20 w-70",

    text: `Olá que bom que você está no 
    4º Prêmio Águas de Jornalismo Ambiental!

    Esta é a sua galeria oficial de fotos no evento.
    Compartilhe momentos incríveis em suas redes sociais.
    Para começar, tire uma selfie e depois clique no botão
    ENVIAR & BUSCAR FOTOS.`,
  },

  default: {
    backgroundImage: "url('/rooftop/base-moments.png')",
    textColor: "text-white",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white w-80",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20 w-80",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-[#f37021]",
    tertiaryButton: "bg-[#1e1e1e]/60 text-white hover:bg-[#1e1e1e]/80",

    text: `Bem-vindo!
Aqui você pode visualizar suas fotos do evento.
Envie uma selfie para continuar.`,
  },
};

export default function SelfiePage() {
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug || "default";
  const theme = themes[slug] || themes.default;

  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) router.push(`/login/${slug}`);
  }, [router, slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfie(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selfie) return alert("Tire uma selfie ou selecione uma da galeria.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("selfie", selfie);
      const token = localStorage.getItem("user_token") || "";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search/${slug}`,
        {
          method: "POST",
          body: fd,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Erro ao buscar fotos");
      const data = await res.json();
      localStorage.setItem("search_result", JSON.stringify(data));
      router.push(`/result/${slug}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const baseButtonClasses =
    "w-full max-w-md py-3 px-5 rounded-xl font-semibold text-sm md:text-base uppercase shadow-md transition-colors duration-200 ease-in-out disabled:opacity-50";

  const tertiarySmallButton = "py-2 px-4 text-xs md:text-sm rounded-lg";

  return (
    <main className="relative w-full h-screen flex flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: theme.backgroundImage }}
      />

      <div className="relative z-10 w-full flex-grow overflow-y-auto flex flex-col items-center px-4 pt-25 pb-10">
        <div className="flex flex-col items-center gap-4 w-80">
          {/* 🔥 TEXTO DINÂMICO */}
          <div
            className={` text-center space-y-2 whitespace-pre-line ${theme.textColor}`}
          >
            {theme.text}
          </div>

          {!selfiePreview ? (
            <label
              className={`${baseButtonClasses} ${theme.ghostButton} cursor-pointer text-center`}
            >
              Tirar Selfie
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Image
                src={selfiePreview}
                width={160}
                height={160}
                alt="Selfie"
                unoptimized
                className="rounded-xl border-2 border-white shadow-md w-[160px] h-[160px] object-cover"
                onClick={() => window.open(selfiePreview, "_blank")}
              />
              <p
                className={`text-[10px] font-semibold max-w-[15rem] text-center leading-relaxed ${theme.textColor}`}
              >
                Importante: por motivos de privacidade, não armazenaremos sua
                selfie.
              </p>
              <button
                type="button"
                className={`${baseButtonClasses} ${theme.secondaryButton}`}
                onClick={() => {
                  setSelfie(null);
                  setSelfiePreview(null);
                }}
              >
                Trocar foto
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          <button
            onClick={handleSubmit}
            disabled={loading || !selfie}
            className={`${baseButtonClasses} ${theme.primaryButton} mt-3`}
          >
            {loading ? "Enviando..." : "Enviar & buscar suas fotos"}
          </button>

          <button
            type="button"
            className={`${baseButtonClasses} ${theme.secondaryButton}`}
            onClick={() => router.push(`/${slug}/gerais`)}
          >
            Fotos Gerais
          </button>

          <button
            type="button"
            className={`${baseButtonClasses} ${theme.secondaryButton}`}
            onClick={() => router.push(`/${slug}/videos`)}
          >
            Vídeos
          </button>
        </div>

        <div className="w-1/2 max-w-xs h-px bg-white/20 my-8" />

        <div className="w-full flex flex-col items-center gap-3">
          <button
            type="button"
            className={`${tertiarySmallButton} ${theme.tertiaryButton} w-full max-w-md`}
            onClick={() => router.push(`/${slug}/pesquisa`)}
          >
            Pesquisa de Satisfação
          </button>

          <FeedbackPopup
            slug={slug}
            buttonClass={`${tertiarySmallButton} ${theme.tertiaryButton} w-full max-w-md`}
            modalButtonClass={`${baseButtonClasses} ${theme.primaryButton}`}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
