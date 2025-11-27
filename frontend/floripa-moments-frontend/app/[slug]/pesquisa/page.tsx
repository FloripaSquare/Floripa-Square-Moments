"use client";

import { useParams } from "next/navigation";
import Footer from "@/components/Footer";

type Theme = {
  backgroundImage?: string;
  surveyUrl: string;
};

const themes: Record<string, Theme> = {
  fs: {
    backgroundImage: "url('/base-moments.png')",
    surveyUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvaS_tBkejjU1XhU6Kqanx7PkDO3NNIUc430LTHj2LxPmWyA/viewform?embedded=true",
  },
  kotai: {
    backgroundImage: "url('/kotai/fundo-kotai.png')",
    surveyUrl: "",
  },
  aegea: {
    backgroundImage: "url('/aegea/fundo-aegea.png')",
    surveyUrl: "https://wqxhkbob.formester.com/f/WumIrSBtF",
  },
  default: {
    backgroundImage: "url('/rooftop/base-moments.png')",
    surveyUrl: "",
  },
};

export default function SurveyPage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug || "default";
  const theme = themes[slug] || themes.default;

  return (
    <main className="relative w-full min-h-screen flex flex-col">
      {/* Fundo dinâmico */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: theme.backgroundImage }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex-grow flex justify-center items-start p-4">
        <div className="w-full max-w-3xl shadow-lg rounded-md overflow-hidden bg-white">
          <iframe
            src={theme.surveyUrl}
            width="100%"
            height="1673"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="block"
          >
            Carregando…
          </iframe>
        </div>
      </div>

      <Footer />
    </main>
  );
}
