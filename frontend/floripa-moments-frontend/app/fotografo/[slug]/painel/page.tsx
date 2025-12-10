"use client";

import { useEffect, useState, useCallback } from "react";
import type { ComponentType } from "react";
import { useRouter, useParams } from "next/navigation";
import UploadPhotosForm from "@/components/events/UploadPhotosForm";
import UploadMediaForm from "@/components/events/UploadMediaForm";
import Footer from "@/components/Footer";
import PhotoManager from "@/components/PhotoManager";
import MediaManager from "@/components/MediaManager";
import { CloudArrowUpIcon, TrashIcon } from "@heroicons/react/24/outline";

// 🚧 MODO DEBUG TEMPORÁRIO - REMOVER ANTES DO DEPLOY
const DEBUG_MODE =
  process.env.NODE_ENV === "development" &&
  typeof window !== "undefined" &&
  window.location.search.includes("debug=true");

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
  const [generalPhotos, setGeneralPhotos] = useState<Array<{ id: string; s3_url: string }>>([]);
  const [loadingGeneralPhotos, setLoadingGeneralPhotos] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // 🚧 MODO DEBUG - Bypass de validação
    if (DEBUG_MODE) {
      console.log("🚧 MODO DEBUG ATIVO - Usando dados fake");
      const fakeData: UserData = {
        id: "fake-photographer-id-123",
        name: "Fotógrafo Teste (DEBUG)",
        email: "teste@debug.com",
        event_slug: slug, // Usa o slug atual da URL
      };
      setUserData(fakeData);
      setLoading(false);
      return; // Para aqui, não executa validação real
    }

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

  // Função para buscar fotos gerais
  const fetchGeneralPhotos = useCallback(async () => {
    if (!userData?.event_slug) return;

    const token = localStorage.getItem("photographer_token");
    if (!token) return;

    setLoadingGeneralPhotos(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/media/general?event_slug=${userData.event_slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setGeneralPhotos(Array.isArray(data) ? data : []);
      } else {
        setGeneralPhotos([]);
      }
    } catch (err) {
      console.error("Erro ao buscar fotos gerais:", err);
      setGeneralPhotos([]);
    } finally {
      setLoadingGeneralPhotos(false);
    }
  }, [userData?.event_slug]);

  // useEffect para carregar fotos gerais quando userData estiver disponível
  useEffect(() => {
    if (userData) {
      fetchGeneralPhotos();
    }
  }, [userData, fetchGeneralPhotos]);

  // Função para deletar foto geral
  const handleDeleteGeneralPhoto = async (photoId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta foto?")) return;

    const token = localStorage.getItem("photographer_token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${photoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setGeneralPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
        alert("Foto excluída com sucesso!");
      } else {
        alert("Erro ao excluir foto. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao deletar foto:", err);
      alert("Erro ao excluir foto. Tente novamente.");
    }
  };

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

          {/* 🚧 BANNER DE MODO DEBUG */}
          {DEBUG_MODE && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-md">
              <p className="font-bold text-lg">🚧 MODO DEBUG ATIVO</p>
              <p className="text-sm mt-1">
                Usando dados fake para visualização. O backend está offline.
              </p>
              <p className="text-xs mt-2 opacity-75">
                Remova <code className="bg-yellow-200 px-1 rounded">?debug=true</code> da URL para modo normal.
              </p>
            </div>
          )}

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

          {/* Upload de Fotos Gerais do Evento */}
          <section className="bg-white shadow-md rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
              Upload de Fotos Gerais do Evento
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Faça upload de fotos gerais do evento (ambiente, decoração, estrutura, etc.) que não estão vinculadas a pessoas específicas.
            </p>

            {/* Área de Upload */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border-2 border-dashed border-gray-300">
              <UploadMediaForm
                events={[
                  {
                    slug: userData.event_slug,
                    title: `Evento: ${userData.event_slug}`,
                  },
                ]}
                onUploaded={() => {
                  fetchGeneralPhotos();
                }}
              />
            </div>

            {/* Grid de Fotos Gerais */}
            {loadingGeneralPhotos ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">Carregando fotos gerais...</p>
              </div>
            ) : generalPhotos.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Fotos Gerais Enviadas ({generalPhotos.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {generalPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={photo.s3_url}
                        alt="Foto geral do evento"
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                      <button
                        onClick={() => handleDeleteGeneralPhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        title="Excluir foto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  Nenhuma foto geral enviada ainda
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Use o formulário acima para fazer upload de fotos gerais
                </p>
              </div>
            )}
          </section>
        </div>
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
