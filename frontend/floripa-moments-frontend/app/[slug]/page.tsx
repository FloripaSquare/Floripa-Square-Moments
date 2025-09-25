"use client";

import { useParams, useRouter } from "next/navigation";

export default function SlugPage() {
  const params = useParams();
  const slug = params?.["slug"] as string;
  const router = useRouter();

  return (
    <main className="relative w-full h-screen text-white">
      {/* Imagem de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-helisul.png')" }}
      />

      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-6">
        <button
          className="px-6 py-3 border-2 border-white rounded-md text-white font-semibold tracking-wide uppercase hover:bg-white hover:text-blue-900 transition transform translate-y-25"
          onClick={() => router.push(`/register/${slug}`)}
        >
          Encontre sua foto
        </button>
      </div>
    </main>
  );
}
