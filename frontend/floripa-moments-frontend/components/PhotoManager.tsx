"use client";

import { useEffect, useState } from "react";
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

  // 🔹 Buscar eventos (somente admin)
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

  // 🔹 Buscar fotos de um evento (lazy load)
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

  // 🔹 Apagar foto
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

  return (
    <section className="bg-white p-6 rounded-xl shadow mt-10">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        {userRole === "ADMIN" ? "📷 Gerenciamento de Fotos" : "📸 Minhas Fotos"}
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
                {/* Cabeçalho do evento */}
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

                {/* Conteúdo do evento */}
                {isOpen && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => fetchPhotos(ev.slug)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                        Atualizar
                      </button>
                    </div>

                    {loading[ev.slug] ? (
                      <p className="text-gray-500">Carregando fotos...</p>
                    ) : !photos[ev.slug] ? (
                      <p className="text-gray-400">
                        Clique em atualizar para carregar.
                      </p>
                    ) : photos[ev.slug].length === 0 ? (
                      <p className="text-gray-500">Nenhuma foto encontrada.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {photos[ev.slug].map((photo) => (
                          <div
                            key={photo.id}
                            className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                          >
                            <img
                              src={photo.s3_url}
                              alt="Foto do evento"
                              className="w-full h-56 object-cover"
                            />
                            <div className="p-4 flex flex-col justify-between">
                              <div>
                                <p className="text-sm text-gray-700">
                                  <strong>Status:</strong> {photo.status}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(photo.created_at).toLocaleString(
                                    "pt-BR"
                                  )}
                                </p>
                              </div>

                              {canDelete(photo) && (
                                <button
                                  onClick={() =>
                                    handleDelete(photo.id, ev.slug)
                                  }
                                  className="mt-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  Apagar
                                </button>
                              )}
                            </div>
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
