"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import Image from "next/image";
import UploadMediaForm from "../components/events/UploadMediaForm";

interface MediaItem {
  id: string;
  s3_key: string;
  // ✅ CORREÇÃO: O backend retorna 's3_url'
  s3_url: string;
  event_slug: string;
}

export default function MediaManager({ eventSlug }: { eventSlug: string }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/photos/${eventSlug}/media`);
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await fetch(`${API_URL}/ingest/${eventSlug}/media?type=general`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: formData,
      });

      await fetchMedia();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, s3Key: string) {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    await fetch(
      `${API_URL}/photos/media/${id}?s3_key=${encodeURIComponent(s3Key)}`,
      { method: "DELETE" }
    );

    fetchMedia();
  }

  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <div className="space-y-10">
      <UploadMediaForm
        events={[{ slug: eventSlug, title: eventSlug }]}
        onUploaded={fetchMedia}
      />

      <hr className="border-gray-300" />

      {loading ? (
        <p>Carregando mídias...</p>
      ) : media.length === 0 ? (
        <p className="text-gray-500">Nenhuma mídia enviada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group border rounded-lg p-2 bg-white shadow"
            >
              <Image
                src={item.s3_url}
                alt="media"
                width={300}
                height={300}
                className="rounded-md object-cover h-32 w-full"
              />

              <button
                onClick={() => handleDelete(item.id, item.s3_key)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
