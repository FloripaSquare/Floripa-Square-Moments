// Versão ajustada da listagem de usuários COM last_name exibido corretamente
// Você pode substituir diretamente seu componente UserListModal por este

"use client";

import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface UserActivity {
  user_name: string;
  last_name?: string | null;
  email: string;
  instagram?: string | null;
  whatsapp?: string | null;
  pesquisas: number;
  downloads: number;
}

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  metrics: UserActivity[];
  eventSlug: string;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

export default function UserListModal({
  isOpen,
  isLoading,
  onClose,
  metrics,
  eventSlug,
}: Props) {
  const handleExportToCSV = () => {
    if (metrics.length === 0) return alert("Não há dados para exportar.");

    const headers = [
      "Nome Completo",
      "Email",
      "Instagram",
      "WhatsApp",
      "Acessos",
      "Downloads",
    ];

    const rows = metrics.map((user) =>
      [
        `"${user.user_name} ${user.last_name ?? ""}"`,
        user.email,
        user.instagram || "",
        user.whatsapp || "",
        user.pesquisas,
        user.downloads,
      ].join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    const filename = `cadastros-e-atividade-${eventSlug}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Cadastros e Atividades - {eventSlug}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportToCSV}
              disabled={metrics.length === 0 || isLoading}
              className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 px-3 py-1.5 rounded-md"
            >
              <ArrowDownTrayIcon className="h-5 w-5" /> Exportar
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="overflow-y-auto p-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : metrics.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome
                  </th>
                  <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Instagram
                  </th>
                  <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    WhatsApp
                  </th>
                  <th className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Acessos
                  </th>
                  <th className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Downloads
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.map((user) => (
                  <tr key={user.email}>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate"
                      title={`${user.user_name} ${user.last_name ?? ""}`}
                    >
                      {user.user_name} {user.last_name ?? ""}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate"
                      title={user.email}
                    >
                      {user.email || "--"}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate"
                      title={user.instagram || ""}
                    >
                      {user.instagram || "--"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {user.whatsapp || "--"}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-500">
                      {user.pesquisas}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">
                      {user.downloads}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-10 text-gray-500">
              Nenhum usuário cadastrado ou com atividade para este evento.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
