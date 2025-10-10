"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function SelfiePage() {
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug || "evento-teste";
  const isFloripaSquare = slug === "floripa-square";

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

  const buttonClasses =
    "w-full max-w-[16rem] px-4 py-3 rounded-md font-semibold uppercase text-center transition duration-200 ease-in-out";

  return (
    <main className="relative w-full h-screen flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          backgroundBlendMode: "overlay",
          backgroundImage: isFloripaSquare
            ? "url('/bg-form-moments.png')"
            : "url('/bg-form.png')",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center gap-6 px-4">
        {/* Texto introdutório */}
        <div className="max-w-[16rem] text-white text-center space-y-2">
          <p className="font-semibold text-lg">
            Olá, que bom que você está no Rooftop Floripa Square.
          </p>
          <p className="text-sm">
            Esta é a sua galeria oficial de fotos no evento, para que você
            compartilhe com suas redes sociais conteúdos, momentos e insights.
          </p>
          <p className="text-sm">
            Para começar, tire uma selfie (ou selecione da galeria) e depois
            clique no botão ENVIAR & BUSCAR FOTOS.
          </p>
        </div>

        {/* Botão Tirar Selfie (abre câmera/galeria) */}
        {!selfiePreview && (
          <label
            className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900 cursor-pointer`}
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
        )}

        {/* Preview da selfie */}
        {selfiePreview && (
          <div className="flex flex-col items-center gap-2">
            <Image
              src={selfiePreview}
              width={200}
              height={200}
              alt="Selfie"
              unoptimized
              className="rounded-md border-2 border-white shadow-md w-[200px] h-[200px] object-cover"
              onClick={() => window.open(selfiePreview, "_blank")}
            />

            <p className="text-white text-[8px] font-semibold max-w-[15rem] text-center leading-relaxed">
              Importante: por motivos de privacidade, não armazenaremos sua
              selfie. Salve uma ou tire uma a cada vez que for buscar por fotos.
            </p>

            <button
              type="button"
              className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900`}
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

        {/* Botão de enviar */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selfie}
          className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900 disabled:opacity-50`}
        >
          {loading ? "Enviando..." : "Enviar & Buscar Fotos"}
        </button>
        <button
          type="button"
          className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900`}
          onClick={() => router.push(`/${slug}/pesquisa`)}
        >
          Pesquisa de Satisfação
        </button>
      </div>
    </main>
  );
}
