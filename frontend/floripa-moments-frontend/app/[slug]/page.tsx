"use client";

import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

type Theme = {
  backgroundUrl: string;
  logo?: string;
  textColorClass: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
};

const themes: Record<string, Theme> = {
  fs: {
    backgroundUrl: "/rooftop/base-moments.png",
    logo: "/rooftop/logo-rooftop.png",
    textColorClass: "text-white",
    gradientFrom: "#f97316",
    gradientTo: "#dc2626",
    glowColor: "rgba(249, 115, 22, 0.5)",
  },
  kotai: {
    backgroundUrl: "/kotai/fundo-kotai.png",
    logo: "/kotai/logo-kotai.png",
    textColorClass: "text-[#f2f2f3]",
    gradientFrom: "#00d4aa",
    gradientTo: "#0891b2",
    glowColor: "rgba(0, 212, 170, 0.5)",
  },
  aegea: {
    backgroundUrl: "/aegea/fundo-aegea.png",
    logo: "/aegea/logo-aegea.png",
    textColorClass: "text-[#f2f2f3]",
    gradientFrom: "#38bdf8",
    gradientTo: "#818cf8",
    glowColor: "rgba(56, 189, 248, 0.5)",
  },
  default: {
    backgroundUrl: "/rooftop/base-moments.png",
    logo: "/rooftop/logo-rooftop.png",
    textColorClass: "text-white",
    gradientFrom: "#f97316",
    gradientTo: "#dc2626",
    glowColor: "rgba(249, 115, 22, 0.5)",
  },
};

export default function SlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.["slug"] as string | undefined;
  const theme = (slug && themes[slug]) || themes.default;

  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const handleButtonClick = (buttonType: string, route: string) => {
    setClickedButton(buttonType);
    setTimeout(() => {
      setClickedButton(null);
      router.push(route);
    }, 150);
  };

  const borderGradient = `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`;

  return (
    <main className={`relative w-full min-h-screen min-h-[100dvh] overflow-hidden ${theme.textColorClass}`}>
      {/* Fundo da página */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${theme.backgroundUrl}')`, backgroundAttachment: "fixed" }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-[340px] space-y-5">

          {/* CAIXA LOGO */}
          {theme.logo && (
            <div
              className="rounded-2xl p-[2px]"
              style={{ background: borderGradient }}
            >
              <div
                className="rounded-[14px] px-6 py-10 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `url('${theme.backgroundUrl}')`, backgroundAttachment: "fixed" }}
              >
                <Image
                  src={theme.logo}
                  alt="Logo do evento"
                  width={360}
                  height={100}
                  className="h-auto w-full max-w-[320px] object-contain"
                  priority
                />
              </div>
            </div>
          )}

          {/* CAIXA BOTÕES */}
          <div
            className="rounded-2xl p-[2px]"
            style={{ background: borderGradient }}
          >
            <div
              className="rounded-[14px] px-5 py-8 flex flex-col items-center bg-cover bg-center"
              style={{ backgroundImage: `url('${theme.backgroundUrl}')`, backgroundAttachment: "fixed" }}
            >

              {/* BOTÃO CADASTRAR */}
              <button
                onClick={() => handleButtonClick("cadastrar", `/register/${slug ?? ""}`)}
                className={`relative w-full max-w-[280px] mb-4 transition-all duration-200 ease-out hover:opacity-90`}
                style={{ boxShadow: clickedButton === "cadastrar" ? `0 0 12px ${theme.glowColor}` : "none" }}
              >
                <div
                  className="rounded-xl p-[1.5px]"
                  style={{ background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
                >
                  <div
                    className="rounded-[10px] py-3 px-6 text-center font-semibold uppercase tracking-[0.12em] text-sm text-white bg-cover bg-center"
                    style={{ backgroundImage: `url('${theme.backgroundUrl}')`, backgroundAttachment: "fixed" }}
                  >
                    Cadastrar
                  </div>
                </div>
              </button>

              {/* BOTÃO LOGIN */}
              <button
                onClick={() => handleButtonClick("login", `/login/${slug ?? ""}`)}
                className={`relative w-full max-w-[280px] transition-all duration-200 ease-out hover:opacity-90`}
                style={{ boxShadow: clickedButton === "login" ? `0 0 12px ${theme.glowColor}` : "none" }}
              >
                <div
                  className="rounded-xl p-[1.5px]"
                  style={{ background: `linear-gradient(90deg, ${theme.gradientTo}, ${theme.gradientFrom})` }}
                >
                  <div
                    className="rounded-[10px] py-3 px-6 text-center font-semibold uppercase tracking-[0.12em] text-sm text-white bg-cover bg-center"
                    style={{ backgroundImage: `url('${theme.backgroundUrl}')`, backgroundAttachment: "fixed" }}
                  >
                    Login
                  </div>
                </div>
              </button>

              {/* TEXTO */}
              <p className="mt-6 text-center text-sm leading-relaxed opacity-80">
                Compartilhe seus momentos e<br />
                torne-se parte desse marco
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
