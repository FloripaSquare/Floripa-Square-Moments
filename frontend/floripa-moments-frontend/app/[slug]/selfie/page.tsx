"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

type Theme = {
  backgroundImage?: string;
  textColor: string;
  primaryButton: string;
  secondaryButton: string;
  ghostButton: string;
};

const themes: Record<string, Theme> = {
  "floripa-square": {
    backgroundImage: "url('/base-moments.jpg')",
    textColor: "text-white",
    primaryButton: "bg-[#f37021] hover:bg-[#d35e1d] text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-[#f37021]",
  },
  default: {
    backgroundImage: 'url("/bg-form.png")',
    textColor: "text-white",
    primaryButton: "bg-[#f37021] hover:bg-orange-600 text-white",
    secondaryButton: "bg-white/10 text-white hover:bg-white/20",
    ghostButton:
      "border-2 border-white text-white hover:bg-white hover:text-blue-900",
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

  // --- Padronização dos botões ---
  const baseButtonClasses =
    "w-full max-w-md py-3 px-5 rounded-xl font-semibold text-sm md:text-base uppercase shadow-md transition-colors duration-200 ease-in-out disabled:opacity-50";

  return (
    <main className="relative w-full h-screen flex flex-col">
      {/* Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: theme.backgroundImage }}
      />

      {/* Conteúdo rolável */}
      <div className="relative z-10 w-full flex-grow overflow-y-auto flex flex-col items-center px-4 pt-25 pb-10">
        {/* Texto e selfie */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div
            className={`max-w-[16rem] text-center space-y-2 ${theme.textColor}`}
          >
            <p className="font-semibold text-lg">
              Olá, que bom que você está no Rooftop!
            </p>
            <p className="text-sm">
              Esta é a sua galeria oficial de fotos no evento. Compartilhe com
              suas redes sociais momentos incríveis.
            </p>
            <p className="text-sm">
              Para começar, tire uma selfie e depois clique no botão ENVIAR &
              BUSCAR FOTOS.
            </p>
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
            {loading ? "Enviando..." : "Enviar & Buscar Fotos"}
          </button>
        </div>

        {/* Separador */}
        <div className="w-1/2 max-w-xs h-px bg-white/20 my-8" />

        {/* Botões secundários */}
        <div className="w-full flex flex-col items-center gap-3">
          <button
            type="button"
            className={`${baseButtonClasses} ${theme.secondaryButton}`}
            onClick={() => router.push(`/${slug}/pesquisa`)}
          >
            Pesquisa de Satisfação
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
      </div>
    </main>
  );
}
