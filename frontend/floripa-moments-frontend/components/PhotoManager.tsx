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
                    <div className="p-4 bg-white border-t border-gray-200">
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
                        <div className={`grid gap-4 ${gridClasses}`}>
                          {photos[ev.slug].map((photo) => (
                            <div
                              key={photo.id}
                              className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-2 group"
                            >
                              {/* MINIATURA COM HOVER SIMPLES */}
                              <div
                                className="relative w-full h-24 overflow-visible cursor-pointer"
                                onClick={() => setModalPhoto(photo)}
                              >
                                <img
                                  src={photo.s3_url}
                                  alt="Foto do evento"
                                  className="w-full h-full object-cover rounded-md
                                             transition-transform duration-300 ease-out
                                             hover:scale-[1.3] hover:z-40 hover:shadow-2xl"
                                />
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

                              {/* BOTÃO DELETAR NO CARD */}
                              {canDelete(photo) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(photo.id, ev.slug);
                                  }}
                                  className="absolute top-2 right-2
                                             bg-red-600 hover:bg-red-700
                                             text-white text-xs px-2 py-1
                                             rounded-md shadow
                                             opacity-0 group-hover:opacity-100
                                             transition-opacity z-30"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
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
