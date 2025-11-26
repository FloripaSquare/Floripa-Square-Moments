"use client";

import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";

type Theme = {
  backgroundImage: string;
  primaryButtonClasses: string;
  ghostButtonClasses: string;
  textColor: string;
};

const themes: Record<string, Theme> = {
  default: {
    backgroundImage: 'url("/bg-moments.jpg")',
    primaryButtonClasses: "",
    ghostButtonClasses: "",
    textColor: "text-white",
  },
};

export default function SlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.["slug"] as string) || "fs";
  const theme = themes.default;

  const baseButtonClasses =
    "px-6 py-3 rounded-xl font-semibold uppercase text-center transition duration-300 ease-in-out shadow-lg";

  return (
    <main
      className={`relative w-full min-h-screen overflow-hidden ${theme.textColor}`}
      style={{
        backgroundImage: theme.backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Botão CADASTRAR */}
      <button
        className={`${baseButtonClasses} ${theme.ghostButtonClasses} absolute left-1/2 -translate-x-1/2 top-[47%] w-[60%]`}
        onClick={() => router.push(`/register/${slug}`)}
      >
        Cadastrar
      </button>

      {/* Botão LOGIN */}
      <button
        className={`${baseButtonClasses} ${theme.primaryButtonClasses} absolute left-1/2 -translate-x-1/2 top-[60%] w-[60%]`}
        onClick={() => router.push(`/login/${slug}`)}
      >
        Login
      </button>
    </main>
  );
}
