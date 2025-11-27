"use client";

interface MediaItem {
  id: string;
  s3_url: string;
}

interface MediaManagerProps {
  mediaItems: MediaItem[];
  onDelete: (id: string) => Promise<void>;
}

export default function MediaManager({
  mediaItems,
  onDelete,
}: MediaManagerProps) {
  if (!mediaItems || mediaItems.length === 0) {
    return <p className="text-gray-500">Nenhuma mídia disponível.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {mediaItems.map((item) => (
        <div
          key={item.id}
          className="border rounded p-2 flex flex-col items-center"
        >
          <img
            src={item.s3_url}
            alt="midia"
            className="w-full h-40 object-cover rounded"
          />

          <button
            onClick={() => onDelete(item.id)}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}
