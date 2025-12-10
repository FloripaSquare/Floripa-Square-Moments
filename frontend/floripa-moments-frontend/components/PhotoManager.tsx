"use client";

import { useEffect, useState } from "react";
import {
  TrashIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { API_URL } from "@/lib/api";

interface EventOption {
  slug: string;
  title: string;
}

interface Photo {
  id: string;
  event_slug: string;
  s3_key: string;
  s3_url: string;
  status: string;
  created_at: string;
  uploader_id?: string;
}

// 🚧 MODO DEBUG – ativado só em development + ?debug=true
const isBrowser = typeof window !== "undefined";

const DEBUG_MODE =
  process.env.NODE_ENV === "development" &&
  isBrowser &&
  window.location.search.includes("debug=true");

const FAKE_PHOTOS: Photo[] = [
  {
    id: "fake-1",
    event_slug: "teste",
    s3_key: "fake/photo1.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-2",
    event_slug: "teste",
    s3_key: "fake/photo2.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-3",
    event_slug: "teste",
    s3_key: "fake/photo3.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-4",
    event_slug: "teste",
    s3_key: "fake/photo4.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-5",
    event_slug: "teste",
    s3_key: "fake/photo5.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-6",
    event_slug: "teste",
    s3_key: "fake/photo6.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-7",
    event_slug: "teste",
    s3_key: "fake/photo7.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-8",
    event_slug: "teste",
    s3_key: "fake/photo8.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-9",
    event_slug: "teste",
    s3_key: "fake/photo9.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-10",
    event_slug: "teste",
    s3_key: "fake/photo10.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-11",
    event_slug: "teste",
    s3_key: "fake/photo11.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-12",
    event_slug: "teste",
    s3_key: "fake/photo12.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-13",
    event_slug: "teste",
    s3_key: "fake/photo13.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-14",
    event_slug: "teste",
    s3_key: "fake/photo14.jpg",
    s3_url:
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-15",
    event_slug: "teste",
    s3_key: "fake/photo15.jpg",
    s3_url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-16",
    event_slug: "teste",
    s3_key: "fake/photo16.jpg",
    s3_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-17",
    event_slug: "teste",
    s3_key: "fake/photo17.jpg",
    s3_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-18",
    event_slug: "teste",
    s3_key: "fake/photo18.jpg",
    s3_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-19",
    event_slug: "teste",
    s3_key: "fake/photo19.jpg",
    s3_url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-20",
    event_slug: "teste",
    s3_key: "fake/photo20.jpg",
    s3_url: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-21",
    event_slug: "teste",
    s3_key: "fake/photo21.jpg",
    s3_url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-22",
    event_slug: "teste",
    s3_key: "fake/photo22.jpg",
    s3_url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-23",
    event_slug: "teste",
    s3_key: "fake/photo23.jpg",
    s3_url: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-24",
    event_slug: "teste",
    s3_key: "fake/photo24.jpg",
    s3_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-25",
    event_slug: "teste",
    s3_key: "fake/photo25.jpg",
    s3_url: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-26",
    event_slug: "teste",
    s3_key: "fake/photo26.jpg",
    s3_url: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-27",
    event_slug: "teste",
    s3_key: "fake/photo27.jpg",
    s3_url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-28",
    event_slug: "teste",
    s3_key: "fake/photo28.jpg",
    s3_url: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-29",
    event_slug: "teste",
    s3_key: "fake/photo29.jpg",
    s3_url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-30",
    event_slug: "teste",
    s3_key: "fake/photo30.jpg",
    s3_url: "https://images.unsplash.com/photo-1482192505345-5655af888e4?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-31",
    event_slug: "teste",
    s3_key: "fake/photo31.jpg",
    s3_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-32",
    event_slug: "teste",
    s3_key: "fake/photo32.jpg",
    s3_url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-33",
    event_slug: "teste",
    s3_key: "fake/photo33.jpg",
    s3_url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-34",
    event_slug: "teste",
    s3_key: "fake/photo34.jpg",
    s3_url: "https://images.unsplash.com/photo-1445262102387-5fbb30a5e59d?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-35",
    event_slug: "teste",
    s3_key: "fake/photo35.jpg",
    s3_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-36",
    event_slug: "teste",
    s3_key: "fake/photo36.jpg",
    s3_url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-37",
    event_slug: "teste",
    s3_key: "fake/photo37.jpg",
    s3_url: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-38",
    event_slug: "teste",
    s3_key: "fake/photo38.jpg",
    s3_url: "https://images.unsplash.com/photo-1488188840666-e2308741a82?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-39",
    event_slug: "teste",
    s3_key: "fake/photo39.jpg",
    s3_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-40",
    event_slug: "teste",
    s3_key: "fake/photo40.jpg",
    s3_url: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-41",
    event_slug: "teste",
    s3_key: "fake/photo41.jpg",
    s3_url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-42",
    event_slug: "teste",
    s3_key: "fake/photo42.jpg",
    s3_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-43",
    event_slug: "teste",
    s3_key: "fake/photo43.jpg",
    s3_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
  {
    id: "fake-44",
    event_slug: "teste",
    s3_key: "fake/photo44.jpg",
    s3_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    status: "active",
    created_at: new Date().toISOString(),
    uploader_id: "fake-uploader",
  },
];

interface PhotoManagerProps {
  eventSlug?: string;
  uploaderId?: string;
  userRole?: "ADMIN" | "PHOTOGRAPHER";
}

export default function PhotoManager({
  eventSlug,
  uploaderId,
  userRole = "ADMIN",
}: PhotoManagerProps) {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);

  // Carrega lista de eventos
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("🚧 MODO DEBUG ATIVO - Usando evento fake");
      setEvents([{ slug: "teste", title: "Evento Teste (DEBUG)" }]);
      return;
    }

    if (userRole === "PHOTOGRAPHER") {
      if (eventSlug) {
        setEvents([{ slug: eventSlug, title: eventSlug }]);
      }
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    fetch(`${API_URL}/admin/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setEvents(data || []))
      .catch((err) => console.error("Erro ao carregar eventos:", err));
  }, [userRole, eventSlug]);

  // Fecha modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalPhoto) {
        setModalPhoto(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalPhoto]);

  // Bloqueia scroll quando modal está aberto
  useEffect(() => {
    if (modalPhoto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalPhoto]);

  const fetchPhotos = async (slug: string) => {
    // DEBUG: usa fotos fake
    if (DEBUG_MODE) {
      console.log("🚧 MODO DEBUG - Carregando fotos fake");
      setLoading((prev) => ({ ...prev, [slug]: true }));

      setTimeout(() => {
        setPhotos((prev) => ({ ...prev, [slug]: FAKE_PHOTOS }));
        setLoading((prev) => ({ ...prev, [slug]: false }));
      }, 500);

      return;
    }

    setLoading((prev) => ({ ...prev, [slug]: true }));
    try {
      let url = `${API_URL}/photos/${slug}`;
      if (userRole === "PHOTOGRAPHER" && uploaderId) {
        url += `?uploader_id=${uploaderId}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data = await res.json();
      setPhotos((prev) => ({ ...prev, [slug]: data }));
    } catch (err) {
      console.error("Erro ao carregar fotos:", err);
      setPhotos((prev) => ({ ...prev, [slug]: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, [slug]: false }));
    }
  };

  const handleToggle = (slug: string) => {
    if (openEvent === slug) {
      setOpenEvent(null);
    } else {
      setOpenEvent(slug);
      if (!photos[slug]) fetchPhotos(slug);
    }
  };

  const handleDelete = async (photoId: string, slug: string) => {
    if (!confirm("Deseja realmente excluir esta foto?")) return;

    // DEBUG: só mexe no state, nada de backend
    if (DEBUG_MODE) {
      setPhotos((prev) => ({
        ...prev,
        [slug]: (prev[slug] || []).filter((p) => p.id !== photoId),
      }));
      if (modalPhoto?.id === photoId) {
        setModalPhoto(null);
      }
      console.log("🚧 DEBUG: foto fake removida do state");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      setPhotos((prev) => ({
        ...prev,
        [slug]: prev[slug].filter((p) => p.id !== photoId),
      }));

      if (modalPhoto?.id === photoId) {
        setModalPhoto(null);
      }
    } catch (err) {
      console.error("Erro ao apagar foto:", err);
      alert("Erro ao apagar foto. Tente novamente.");
    }
  };

  const canDelete = (photo: Photo) => {
    if (userRole === "ADMIN") return true;
    if (userRole === "PHOTOGRAPHER" && photo.uploader_id === uploaderId)
      return true;
    return false;
  };

  const isAdmin = userRole === "ADMIN";
  const gridClasses = isAdmin
    ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <section className="bg-white p-6 rounded-xl shadow mt-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          {isAdmin ? "📷 Gerenciamento de Fotos" : "📸 Minhas Fotos"}
        </h2>

        {DEBUG_MODE && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-md">
            <p className="font-bold text-lg">🚧 MODO DEBUG ATIVO</p>
            <p className="text-sm mt-1">
              Usando fotos de exemplo do Unsplash. O backend está offline.
            </p>
            <p className="text-xs mt-2 opacity-75">
              Remova{" "}
              <code className="bg-yellow-200 px-1 rounded">?debug=true</code> da
              URL para voltar ao modo normal.
            </p>
          </div>
        )}

        {events.length === 0 ? (
          <p className="text-gray-500">Nenhum evento encontrado.</p>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => {
              const isOpen = openEvent === ev.slug;
              return (
                <div
                  key={ev.slug}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Header */}
                  <button
                    onClick={() => handleToggle(ev.slug)}
                    className="flex justify-between items-center w-full bg-gray-50 hover:bg-gray-100 p-4 text-left font-semibold text-gray-800"
                  >
                    <span>
                      {ev.title} ({ev.slug})
                    </span>
                    {isOpen ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 px-6 md:px-10 lg:px-14 bg-white border-t border-gray-200">
                      {/* Botão atualizar */}
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => fetchPhotos(ev.slug)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                          Atualizar
                        </button>
                      </div>

                      {/* Conteúdo */}
                      {loading[ev.slug] ? (
                        <p className="text-gray-500">Carregando fotos...</p>
                      ) : !photos[ev.slug] ? (
                        <p className="text-gray-400">
                          Clique em atualizar para carregar.
                        </p>
                      ) : photos[ev.slug].length === 0 ? (
                        <p className="text-gray-500">
                          Nenhuma foto encontrada.
                        </p>
                      ) : (
                        <div className={`grid gap-4 ${gridClasses} overflow-visible`}>
                          {photos[ev.slug].map((photo, index, array) => {
                            // Calcular número de colunas baseado no grid
                            // Admin: grid-cols-2 md:grid-cols-4 lg:grid-cols-6
                            // Fotógrafo: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                            const getCols = () => {
                              if (typeof window === 'undefined') return isAdmin ? 6 : 3;

                              if (isAdmin) {
                                if (window.innerWidth >= 1024) return 6; // lg
                                if (window.innerWidth >= 768) return 4;  // md
                                return 2; // mobile
                              } else {
                                if (window.innerWidth >= 1024) return 3; // lg
                                if (window.innerWidth >= 640) return 2;  // sm
                                return 1; // mobile
                              }
                            };

                            const cols = getCols();
                            const isLastInRow = (index + 1) % cols === 0 || index === array.length - 1;

                            return (
                              <div
                                key={photo.id}
                                className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-2 group hover:z-50 overflow-visible"
                              >
                                {/* Container da imagem - zoom só em desktop (md+) */}
                                <div
                                  className={`relative w-full h-24 overflow-visible cursor-pointer
                                              transition-transform duration-300 ease-out
                                              md:group-hover:scale-[2.0]
                                              ${isLastInRow ? "origin-right" : "origin-left"}`}
                                  onClick={() => setModalPhoto(photo)}
                                >
                                  <img
                                    src={photo.s3_url}
                                    alt="Foto do evento"
                                    className="w-full h-full object-cover rounded-md shadow-sm"
                                  />

                                  {/* BOTÃO DENTRO - ESCALA JUNTO */}
                                  {canDelete(photo) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(photo.id, ev.slug);
                                      }}
                                      className="absolute top-1 right-1
                                                 bg-red-600 hover:bg-red-700
                                                 text-white text-xs p-1.5
                                                 rounded-md shadow-lg
                                                 opacity-0 group-hover:opacity-100
                                                 transition-opacity"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>

                                {/* INFO */}
                                <div className="mt-2">
                                  <p className="text-xs text-gray-700">
                                    <strong>Status:</strong> {photo.status}
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-1">
                                    {new Date(
                                      photo.created_at
                                    ).toLocaleString("pt-BR")}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL DE FOTO AMPLIADA */}
      {modalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setModalPhoto(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão X */}
            <button
              onClick={() => setModalPhoto(null)}
              className="absolute -top-12 right-0
                         bg-white hover:bg-gray-100
                         text-gray-800 p-2 rounded-full shadow-lg
                         transition-all"
              title="Fechar (ESC)"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* IMAGEM AMPLIADA */}
            <img
              src={modalPhoto.s3_url}
              alt="Foto ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />

            {/* BOTÃO DELETAR NO MODAL */}
            {canDelete(modalPhoto) && (
              <button
                onClick={() => {
                  const slug = modalPhoto.event_slug;
                  handleDelete(modalPhoto.id, slug);
                }}
                className="absolute top-4 left-4
                           bg-red-600 hover:bg-red-700
                           text-white px-4 py-2 rounded-lg shadow-lg
                           flex items-center gap-2
                           transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
                Excluir
              </button>
            )}

            {/* INFO NO MODAL */}
            <div
              className="absolute bottom-4 left-4 right-4
                            bg-black/70 text-white px-4 py-3 rounded-lg"
            >
              <p className="text-sm">
                <strong>Status:</strong> {modalPhoto.status}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Enviado em:{" "}
                {new Date(modalPhoto.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
