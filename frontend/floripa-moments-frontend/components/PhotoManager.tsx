"use client";

import { useEffect, useState, useRef } from "react";
import {
  TrashIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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

  // Estados para controlar delay do zoom
  const [zoomEnabled, setZoomEnabled] = useState<string | null>(null);
  const hoverTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const leaveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (userRole === "PHOTOGRAPHER") {
      setEvents([{ slug: eventSlug!, title: eventSlug! }]);
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

  const fetchPhotos = async (slug: string) => {
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

    try {
      const res = await fetch(`${API_URL}/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      setPhotos((prev) => ({
        ...prev,
        [slug]: prev[slug].filter((p) => p.id !== photoId),
      }));

      // fecha o zoom se deletar a foto ampliada
      if (zoomEnabled === photoId) {
        setZoomEnabled(null);
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
    <section className="bg-white p-6 rounded-xl shadow mt-10">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        {isAdmin ? "📷 Gerenciamento de Fotos" : "📸 Minhas Fotos"}
      </h2>

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
                      <p className="text-gray-500">Nenhuma foto encontrada.</p>
                    ) : (
                      <div className={`grid gap-4 ${gridClasses}`}>
                        {photos[ev.slug].map((photo) => (
                          <div
                            key={photo.id}
                            className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-2"
                            onMouseEnter={() => {
                              // limpa timers antigos
                              if (hoverTimers.current[photo.id]) {
                                clearTimeout(hoverTimers.current[photo.id]);
                              }
                              if (leaveTimers.current[photo.id]) {
                                clearTimeout(leaveTimers.current[photo.id]);
                              }

                              // delay de entrada — abre o zoom após 150ms
                              hoverTimers.current[photo.id] = setTimeout(() => {
                                setZoomEnabled(photo.id);
                              }, 150);
                            }}
                            onMouseLeave={() => {
                              // se o mouse sair antes do delay, cancela
                              if (hoverTimers.current[photo.id]) {
                                clearTimeout(hoverTimers.current[photo.id]);
                              }

                              // delay pequeno para permitir acessar imagens mais internas
                              leaveTimers.current[photo.id] = setTimeout(() => {
                                setZoomEnabled((prev) =>
                                  prev === photo.id ? null : prev
                                );
                              }, 300); // 0.3s
                            }}
                          >
                            {/* MINIATURA */}
                            <div className="relative w-full h-24 overflow-hidden rounded-md">
                              <img
                                src={photo.s3_url}
                                alt="Foto do evento"
                                className="w-full h-full object-cover rounded-md transition-all duration-300"
                              />
                            </div>

                            {/* ZOOM — aparece só para ESTA foto */}
                            {zoomEnabled === photo.id && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
                                onMouseLeave={() => {
                                  // fecha o zoom com delay
                                  leaveTimers.current[photo.id] = setTimeout(
                                    () => {
                                      setZoomEnabled(null);
                                    },
                                    300
                                  );
                                }}
                                onMouseEnter={() => {
                                  // se entrou no zoom, cancela o fechamento automático
                                  if (leaveTimers.current[photo.id]) {
                                    clearTimeout(leaveTimers.current[photo.id]);
                                  }
                                }}
                              >
                                <div className="relative">
                                  <img
                                    src={photo.s3_url}
                                    alt="Zoom"
                                    className="max-w-[750px] max-h-[80vh] rounded-lg shadow-2xl border-2 border-white"
                                  />

                                  {/* Botão deletar dentro */}
                                  {canDelete(photo) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(photo.id, ev.slug);
                                      }}
                                      className="
              absolute top-3 right-3
              bg-red-600 hover:bg-red-700 
              text-white text-sm px-3 py-1 rounded-md shadow-lg
            "
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* INFO */}
                            <div className="mt-2">
                              <p className="text-xs text-gray-700">
                                <strong>Status:</strong> {photo.status}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {new Date(photo.created_at).toLocaleString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>

                            {/* BOTÃO DELETAR NO CARD */}
                            {canDelete(photo) && (
                              <button
                                onClick={() => handleDelete(photo.id, ev.slug)}
                                className="
        absolute top-2 right-2 
        bg-red-600 hover:bg-red-700 
        text-white text-xs px-2 py-1 
        rounded-md shadow
        z-30
      "
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
  );
}
