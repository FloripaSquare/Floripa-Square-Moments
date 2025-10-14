"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
// NOVO: Adicionado o ícone ArrowDownTrayIcon para o botão de exportar
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

// Interface para os dados do usuário que virão da API
interface User {
  id: string;
  name: string;
  last_name: string;
  instagram?: string | null;
  whatsapp?: string | null;
  email: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  eventSlug: string;
}

export default function UserListModal({ isOpen, onClose, eventSlug }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Busca os usuários apenas quando o modal for aberto
    if (isOpen && eventSlug) {
      const fetchUsers = async () => {
        setLoading(true);
        setUsers([]); // Limpa a lista anterior
        try {
          const token = localStorage.getItem("admin_token");
          if (!token) throw new Error("Token de admin não encontrado");

          const res = await fetch(`${API_URL}/admin/users/${eventSlug}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
          } else {
            throw new Error("Falha ao buscar usuários");
          }
        } catch (error) {
          console.error("Erro ao buscar usuários:", error);
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, eventSlug]);

  // --- INÍCIO DA LÓGICA DE EXPORTAÇÃO ---
  const handleExportToCSV = () => {
    if (users.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // 1. Define os cabeçalhos das colunas
    const headers = ["Nome Completo", "Email", "Instagram", "WhatsApp"];

    // 2. Mapeia os dados dos usuários para as linhas do CSV
    //    Envolve o nome completo com aspas para evitar problemas com vírgulas
    const rows = users.map((user) =>
      [
        `"${user.name} ${user.last_name}"`,
        user.email,
        user.instagram || "", // Usa string vazia para valores nulos
        user.whatsapp || "",
      ].join(",")
    ); // Junta as colunas com vírgula

    // 3. Junta o cabeçalho e as linhas com quebras de linha
    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4. Cria um Blob (Binary Large Object) com o conteúdo CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // 5. Cria um link temporário para iniciar o download
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // Cria um nome de arquivo dinâmico
      const filename = `cadastros-${eventSlug}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Libera a memória do navegador
    }
  };
  // --- FIM DA LÓGICA DE EXPORTAÇÃO ---

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Cabeçalho do Modal */}
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Lista de Cadastros - {eventSlug}
          </h2>
          <div className="flex items-center gap-4">
            {/* NOVO: Botão de exportação */}
            <button
              onClick={handleExportToCSV}
              disabled={loading || users.length === 0}
              className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-3 py-1.5 rounded-md"
              title="Exportar para CSV"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Exportar
            </button>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Corpo do Modal */}
        <main className="overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="ml-3 text-gray-600">Carregando usuários...</p>
            </div>
          ) : users.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome Completo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Instagram
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    WhatsApp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name} {user.last_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {user.instagram || "--"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {user.whatsapp || "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-10 text-gray-500">
              Nenhum usuário cadastrado para este evento.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
