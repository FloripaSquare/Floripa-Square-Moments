"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

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
      }
    }, "image/jpeg");

    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfie(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // remove tudo que não é número
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    setForm({ ...form, whatsapp: val });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-form.png')" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-lg rounded-md p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Cadastro & Selfie
        </h1>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome"
            className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={handleWhatsappChange}
            placeholder="(00) 00000-0000"
            className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram
          </label>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            placeholder="@usuario"
            className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

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
              <Image
                src={selfiePreview}
                alt="Selfie"
                width={192}
                height={192}
                unoptimized
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

        {/* Submit */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
          disabled={loading}
        >
          {loading && (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
          )}
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
