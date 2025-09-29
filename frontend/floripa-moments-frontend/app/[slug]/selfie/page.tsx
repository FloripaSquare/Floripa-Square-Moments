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
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) router.push(`/login/${slug}`);
    return () => stopCamera();
  }, [router, slug]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setSelfie(null);
    setSelfiePreview(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setUseCamera(true);
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert(
        "Erro ao acessar a câmera. Verifique permissões e se está usando HTTPS."
      );
      setUseCamera(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvasRef.current.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSelfie(file);
          setSelfiePreview(URL.createObjectURL(file));
          setUseCamera(false);
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
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

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center gap-6 px-4">
        {/* Texto introdutório */}
        <div className="max-w-sm text-white text-center space-y-2">
          <p className="font-semibold text-lg">
            Olá, que bom que você está no Rooftop Floripa Square.
          </p>
          <p className="text-sm">
            Esta é a sua galeria oficial de fotos no evento, para que você
            compartilhe com suas redes sociais conteúdos, momentos e insights.
          </p>
          <p className="text-sm">
            Para começar, tire uma selfie, e depois clique no botão ENVIAR &
            BUSCAR FOTOS.
          </p>
        </div>

        {/* Botão iniciar câmera */}
        {!selfiePreview && !useCamera && (
          <button
            type="button"
            className={`${buttonClasses} border-2 border-white text-white hover:bg-white hover:text-blue-900`}
            onClick={startCamera}
          >
            Tirar Selfie
          </button>
        )}

        {/* Visualização da câmera */}
        {useCamera && (
          <div className="flex flex-col items-center gap-2">
            <video
              ref={videoRef}
              className="w-72 h-72 border-2 border-white rounded-md bg-black shadow-md"
              autoPlay
              playsInline
              style={{ transform: "scaleX(-1)" }}
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
              unoptimized
              className="rounded-md border-2 border-white shadow-md w-[200px] h-[200px] object-cover"
              onClick={() => window.open(selfiePreview, "_blank")}
            />

            {/* Texto de privacidade */}
            <p className="text-white text-sm max-w-xs text-center">
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
      </div>
    </main>
  );
}
