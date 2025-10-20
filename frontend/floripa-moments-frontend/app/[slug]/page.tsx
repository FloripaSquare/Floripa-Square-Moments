"use client";

import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";

// ✅ 1. Interface e Objeto de Configuração de Temas
// Centraliza todos os estilos que mudam de acordo com o evento.
type Theme = {
  backgroundImage: string;
  primaryButtonClasses: string; // Botão principal, com preenchimento (Login)
  ghostButtonClasses: string; // Botão secundário, com borda (Cadastrar)
  textColor: string;
};

const themes: Record<string, Theme> = {
  "floripa-square": {
    backgroundImage: 'url("/bg-moments.jpg")', // Lembre-se de adicionar esta imagem na pasta /public
    primaryButtonClasses:
      "bg-white text-orange-600 font-bold hover:bg-gray-200",
    ghostButtonClasses:
      "border-2 border-white text-white hover:bg-white hover:text-orange-600",
    textColor: "text-white",
  },
  default: {
    // Tema padrão para "helisul" ou qualquer outro slug
    backgroundImage: 'url("/bg-helisul.png")',
    primaryButtonClasses:
      "bg-cyan-400 text-blue-900 font-bold hover:bg-cyan-500",
    ghostButtonClasses:
      "border-2 border-white text-white hover:bg-white hover:text-blue-900",
    textColor: "text-white",
  },
};

export default function SlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.["slug"] as string;

  // ✅ 2. Seleciona o tema correto ou o padrão
  const theme = themes[slug] || themes.default;

  // ✅ 3. Classes base para todos os botões para não repetir código
  const baseButtonClasses =
    "w-full max-w-xs px-4 py-3 rounded-md font-semibold uppercase text-center transition duration-300 ease-in-out shadow-lg";

  return (
    <main className={`relative w-full h-screen ${theme.textColor}`}>
      {/* ✅ 4. Fundo de tela dinâmico */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: theme.backgroundImage }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-6 gap-4">
        {/* ✅ 5. Botões agora usam classes do Tailwind vindas do tema */}
        {/* Botão de Cadastro (estilo "ghost") */}
        <button
          className={`${baseButtonClasses} ${theme.ghostButtonClasses}`}
          onClick={() => router.push(`/register/${slug}`)}
        >
          Cadastrar
        </button>

        {/* Botão de Login (estilo "primary") */}
        <button
          className={`${baseButtonClasses} ${theme.primaryButtonClasses}`}
          onClick={() => router.push(`/login/${slug}`)}
        >
          Login
        </button>
      </div>
      <Footer />
    </main>
  );
}
