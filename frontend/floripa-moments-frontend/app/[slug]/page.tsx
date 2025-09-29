"use client";

import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";

export default function SlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.["slug"] as string;

  const buttonStyle = {
    width: "220px",
    height: "50px",
    borderRadius: "8px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    transition: "all 0.3s ease",
  };

  const buttonClasses =
    "w-full max-w-xs px-2 py-2 rounded-md font-semibold uppercase text-center transition duration-200 ease-in-out";

  return (
    <main className="relative w-full h-screen text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-helisul.png')" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-6 gap-4 pt-40">
        {/* Botão de Cadastro (borda branca) */}
        <button
          style={{
            ...buttonStyle,
            backgroundColor: "transparent",
            color: "white",
            border: "2px solid white",
          }}
          onClick={() => router.push(`/register/${slug}`)}
        >
          Cadastrar
        </button>

        {/* Botão de Login (azul claro) */}
        <button
          style={{
            ...buttonStyle,
            backgroundColor: "rgb(12, 212, 255)",
            color: "rgb(10, 0, 127)",
            border: "none",
          }}
          onClick={() => router.push(`/login/${slug}`)}
        >
          Login
        </button>
      </div>
      <Footer />
    </main>
  );
}
