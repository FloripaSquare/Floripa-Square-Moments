"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function SelfiePage() {
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug || "evento-teste";

  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const surveyUrl = process.env.NEXT_PUBLIC_SURVEY_URL || "/";

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) router.push(`/login/${slug}`);
  }, [router, slug]);

  const stopCamera = () => {
    (videoRef.current?.srcObject as MediaStream)
      ?.getTracks()
      .forEach((t) => t.stop());
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSelfie(file);
        setSelfiePreview(URL.createObjectURL(file));
        setUseCamera(false);
        stopCamera();
      }
    }, "image/jpeg");
  };

  const handleFileChange = (file: File) => {
    setSelfie(file);
    setSelfiePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selfie) return alert("Tire ou selecione uma selfie antes.");

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
    "w-full max-w-xs px-4 py-3 rounded-md font-semibold uppercase text-center transition duration-200 ease-in-out";

  return (
    <main className="relative w-full h-screen flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          backgroundBlendMode: "overlay",
          backgroundImage: "url('/bg-form.png')",
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center gap-4 px-4">
        {!selfiePreview && !useCamera && (
          <label
            className={`${buttonClasses} border-2 border-white text-white cursor-pointer hover:bg-white hover:text-blue-900`}
          >
            Selecionar da galeria
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
              }}
            />
          </label>
        )}

        {useCamera && (
          <div className="flex flex-col items-center gap-2">
            <video
              ref={videoRef}
              className="w-72 h-72 border-2 border-white rounded-md bg-black shadow-md"
              autoPlay
            />
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                type="button"
                className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900`}
                onClick={takePhoto}
              >
                Capturar
              </button>
              <button
                type="button"
                className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900`}
                onClick={() => {
                  setUseCamera(false);
                  stopCamera();
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {selfiePreview && (
          <div className="flex flex-col items-center gap-2">
            <Image
              src={selfiePreview}
              width={200}
              height={200}
              alt="Selfie"
              className="rounded-md border-2 border-white cursor-pointer shadow-md"
              onClick={() => window.open(selfiePreview, "_blank")}
            />
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900 disabled:opacity-50`}
        >
          {loading ? "Enviando..." : "Enviar & Buscar Fotos"}
        </button>

        <button
          onClick={() => router.push(surveyUrl)}
          className={`${buttonClasses} border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900`}
        >
          Pesquisa de Satisfação
        </button>
      </div>
    </main>
  );
}
