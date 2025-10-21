"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import UploadPhotosForm from "@/components/events/UploadPhotosForm";
import Footer from "@/components/Footer";

interface UserData {
  id: string;
  name: string;
  email: string;
  event_slug: string;
}

export default function PhotographerPanel() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug ?? "";

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("photographer_token");
    if (!token) {
      router.push(`/fotografo/${slug}/login`);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("Token inválido ou usuário não encontrado");
        return res.json();
      })
      .then((data: UserData) => {
        if (data.event_slug !== slug) {
          router.push(`/fotografo/${slug}`);
          return;
        }
        setUserData(data);
      })
      .catch(() => router.push(`/fotografo/${slug}`))
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg animate-pulse">
          Carregando painel...
        </p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">
          Não foi possível obter os dados do usuário.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Painel do Fotógrafo
          </h1>
        </header>

        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Upload de Fotos
          </h2>
          <p className="text-gray-500 mb-6">
            Faça o upload das fotos para o seu evento. Você pode selecionar
            múltiplos arquivos.
          </p>

          <UploadPhotosForm
            events={[
              {
                slug: userData.event_slug,
                title: `Evento: ${userData.event_slug}`,
              },
            ]}
            userRole="PHOTOGRAPHER"
            eventSlug={userData.event_slug}
          />
        </section>
      </div>
      <Footer />
    </main>
  );
}
