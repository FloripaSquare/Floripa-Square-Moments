"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useRouter, useParams } from "next/navigation";
import UploadPhotosForm from "@/components/events/UploadPhotosForm";
import Footer from "@/components/Footer";
import PhotoManager from "@/components/PhotoManager";
import MediaManager from "@/components/MediaManager";

interface UserData {
  id: string;
  name: string;
  email: string;
  event_slug: string;
}

interface PhotoManagerProps {
  eventSlug: string;
  uploaderId: string;
  userRole: string;
}

export default function PhotographerPanel() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug ?? "";

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const token = localStorage.getItem("photographer_token");
    const loginUrl = `/fotografo/${slug}`;

    if (!token) {
      router.push(loginUrl);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403)
          throw new Error("Token inválido");
        if (!res.ok) throw new Error("Falha ao buscar dados do usuário");
        return res.json();
      })
      .then((data: UserData) => {
        // Valida se o token é válido para este evento
        if (data.event_slug !== slug) {
          localStorage.removeItem("photographer_token");
          router.push(`${loginUrl}?error=evento_invalido`);
          return;
        }
        setUserData(data);
      })
      .catch(() => {
        localStorage.removeItem("photographer_token");
        router.push(`${loginUrl}?error=token_invalido`);
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  const PhotoManagerTyped = PhotoManager as ComponentType<PhotoManagerProps>;

  if (loading) return <LoadingIndicator />;
  if (!userData) return <ErrorDisplay />;

  return (
    <>
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Painel do Fotógrafo
            </h1>
            <p className="text-lg text-gray-600">Bem-vindo, {userData.name}!</p>
          </header>

          <section className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Upload de Fotos
            </h2>
            <p className="text-gray-500 mb-6">
              Faça o upload das fotos para o evento:{" "}
              <span className="font-semibold">{userData.event_slug}</span>.
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
              uploaderId={userData.id}
            />
          </section>

          <section className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Minhas Fotos
            </h2>
            <PhotoManagerTyped
              eventSlug={userData.event_slug}
              userRole="PHOTOGRAPHER"
              uploaderId={userData.id}
            />
          </section>
        </div>
        <MediaManager eventSlug={userData.event_slug} />
      </main>
      <Footer />
    </>
  );
}

// --- Auxiliares ---
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-lg animate-pulse">
        Carregando painel...
      </p>
    </div>
  );
}

function ErrorDisplay() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500 text-lg">Validando acesso...</p>
    </div>
  );
}
