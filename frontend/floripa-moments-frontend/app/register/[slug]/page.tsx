/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

async function registerUser(data: {
  name: string;
  email: string;
  whatsapp?: string;
  instagram?: string;
  accepted_lgpd: boolean;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.detail || "Erro ao cadastrar usuário");
  }
  return res.json();
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const eventSlug =
    params?.slug || process.env.NEXT_PUBLIC_EVENT_SLUG || "evento-teste";

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    instagram: "",
    accepted_lgpd: false,
  });

  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ativar câmera
  const startCamera = async () => {
    if (navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } else {
      alert("Seu navegador não suporta captura de vídeo.");
    }
  };

  // Tirar foto da câmera
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
        setUseCamera(false); // fecha a câmera
      }
    }, "image/jpeg");

    // Para a câmera
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  };

  // Upload de arquivo da galeria
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfie(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfie) {
      setMsg({
        text: "Envie ou tire uma selfie antes de continuar.",
        ok: false,
      });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      await registerUser(form);

      const fd = new FormData();
      fd.append("selfie", selfie);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search/${eventSlug}`,
        {
          method: "POST",
          body: fd,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erro ao buscar fotos");

      const data = await res.json();
      localStorage.setItem("search_result", JSON.stringify(data));
      router.push(`/result/${eventSlug}`);
    } catch (err: unknown) {
      if (err instanceof Error) setMsg({ text: err.message, ok: false });
      else setMsg({ text: "Erro inesperado", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Cadastro & Selfie
        </h1>

        {/* Campos do usuário */}
        {["name", "email", "whatsapp", "instagram"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={
                field === "email"
                  ? "email"
                  : field === "whatsapp"
                  ? "tel"
                  : "text"
              }
              value={(form as any)[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder={
                field === "email"
                  ? "seu@email.com"
                  : field === "whatsapp"
                  ? "(00) 00000-0000"
                  : "@usuario"
              }
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required={field === "name" || field === "email"}
            />
          </div>
        ))}

        {/* Selfie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sua Selfie
          </label>

          {!selfiePreview && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => {
                  setUseCamera(true);
                  startCamera();
                }}
              >
                Tirar selfie na hora
              </button>

              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileUpload}
                className="w-full text-gray-700"
              />
            </div>
          )}

          {useCamera && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <video
                ref={videoRef}
                className="w-64 h-64 rounded border"
                autoPlay
              />
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={takePhoto}
              >
                Tirar foto
              </button>
            </div>
          )}

          {selfiePreview && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <img
                src={selfiePreview}
                alt="Selfie"
                className="w-48 h-48 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => {
                  setSelfie(null);
                  setSelfiePreview(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Trocar selfie
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* LGPD */}
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            checked={form.accepted_lgpd}
            onChange={(e) =>
              setForm({ ...form, accepted_lgpd: e.target.checked })
            }
            required
            className="accent-blue-600"
          />
          <span className="text-sm">
            Autorizo o uso da minha imagem conforme LGPD
          </span>
        </label>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
          ) : null}
          Enviar & Buscar Fotos
        </button>

        {msg && (
          <p
            className={`mt-2 text-center text-sm ${
              msg.ok ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg.text}
          </p>
        )}
      </form>
    </main>
  );
}
