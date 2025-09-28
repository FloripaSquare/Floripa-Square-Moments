"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";

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

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) router.push(`/login/${slug}`);
  }, [router, slug]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setUseCamera(true);
      }
    } catch (err) {
      alert("Erro ao acessar a câmera. Verifique as permissões.");
    }
  };

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

  const handleSubmit = async () => {
    if (!selfie) return alert("Tire uma selfie antes.");

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
    "w-full max-w-xs px-2 py-2 rounded-md font-semibold uppercase text-center transition duration-200 ease-in-out";

  return (
    <main className="relative w-full min-h-screen flex flex-col justify-center items-center">
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
      <div className="relative z-10 flex flex-col items-center w-80 px-4 gap-6">
        {/* Texto de introdução */}
        <div
          className="text-white max-w-2xl text-center"
          style={{ textShadow: "0 0 5px rgba(0,0,0,0.7)" }}
        >
          <p className="font-semibold text-lg">
            Olá, que bom que você está no Rooftop Floripa Square.
          </p>
          <p className="mt-2 text-sm">
            Esta é a sua galeria oficial de fotos no evento, para que você
            compartilhe com suas redes sociais conteúdos, momentos e insights.
          </p>
          <p className="mt-2 text-sm font-medium">
            Para começar, tire uma selfie e depois clique no botão{" "}
            <strong>ENVIAR & BUSCAR FOTOS</strong>.
          </p>
        </div>

        {/* Botão para abrir câmera */}
        {!selfiePreview && !useCamera && (
          <button
            type="button"
            className={`${buttonClasses} border-2 border-white text-white cursor-pointer hover:bg-white hover:text-blue-900 text-sm`}
            onClick={startCamera}
          >
            TIRAR SELFIE
          </button>
        )}

        {/* Câmera */}
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

        {/* Preview da selfie */}
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
            {/* Texto importante vai abaixo da selfie */}
            <span
              className="text-white font-semibold text-xs text-center mt-2"
              style={{ textShadow: "0 0 5px rgba(0,0,0,0.7)" }}
            >
              <strong className="text-sm">Importante:</strong>
              <br />
              Por motivos de privacidade, não armazenaremos sua selfie. Salve
              uma ou tire a cada vez que for buscar por fotos.
            </span>
            <button
              type="button"
              className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900`}
              onClick={() => {
                setSelfie(null);
                setSelfiePreview(null);
              }}
            >
              Tirar outra selfie
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Botão de enviar */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900 disabled:opacity-50`}
        >
          {loading ? "Enviando..." : "Enviar & Buscar Fotos"}
        </button>
      </div>
            <Footer />
      
    </main>
  );
}
