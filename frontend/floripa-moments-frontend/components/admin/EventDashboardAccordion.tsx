"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { API_URL } from "@/lib/api"; // Certifique-se de que este import existe

// Componentes de Modal
import EditEventModal from "./EditEventModal";
import UserListModal from "./UserListModal";

// --- Interfaces (Tipos de Dados) ---

interface Event {
  slug: string;
  title: string;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  participants_count?: number | null;
}

interface AggregatedMetric {
  event_slug: string | null;
  user_name: string;
  pesquisas: number;
  cadastros: number;
}

interface Props {
  event: Event;
  metrics: AggregatedMetric[];
  onRefreshed: () => void; // Função para recarregar os dados do dashboard
}

// --- Componente de Card de Estatística ---
function EventStatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm hover:bg-gray-100 transition-colors">
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
  );
}

// --- Componente Principal do Acordeão ---

export default function EventDashboardAccordion({
  event,
  metrics,
  onRefreshed,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // ✅ Estados para a funcionalidade de download
  const [downloadLink, setDownloadLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("COPIAR");

  // Filtra e calcula as métricas apenas para este evento
  const eventMetrics = metrics.filter((m) => m.event_slug === event.slug);
  const totalCadastros = eventMetrics.reduce((sum, m) => sum + m.cadastros, 0);
  const totalAcessos = eventMetrics.reduce((sum, m) => sum + m.pesquisas, 0);

  // Formata a data e o horário para exibição
  const eventDateFormatted = new Date(event.event_date).toLocaleDateString(
    "pt-BR",
    { timeZone: "UTC" }
  );

  const timeDisplay =
    event.start_time && event.end_time ? (
      `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`
    ) : (
      <span className="text-orange-500 font-normal">(Horário a definir)</span>
    );

  // ✅ Função para chamar a API e gerar o link
  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setDownloadLink("");
    setCopyButtonText("COPIAR");

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Token de admin não encontrado.");

      const res = await fetch(
        `${API_URL}/admin/events/${event.slug}/generate-download-link`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Falha ao gerar o link.");
      }

      const data = await res.json();
      setDownloadLink(data.url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Erro: ${err.message}`);
      } else {
        alert(`Erro desconhecido: ${String(err)}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ Função para copiar o link gerado
  const handleCopyLink = () => {
    if (!downloadLink) return;
    navigator.clipboard.writeText(downloadLink).then(() => {
      setCopyButtonText("COPIADO!");
      setTimeout(() => setCopyButtonText("COPIAR"), 2000); // Reseta o texto após 2 segundos
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow transition-shadow hover:shadow-lg">
        {/* Header do Acordeão */}
        <div className="flex justify-between items-center p-4">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 cursor-pointer pr-4"
          >
            <h2 className="text-lg font-bold text-gray-800">{event.title}</h2>
            <p className="text-sm text-gray-600">
              {eventDateFormatted} | {timeDisplay}
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
              title="Definir horário do evento"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {isOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Conteúdo do Acordeão */}
        {isOpen && (
          <div className="p-6 border-t border-gray-200 space-y-6">
            {/* KPIs do Evento */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <EventStatCard
                title="Participantes"
                value={event.participants_count ?? "--"}
              />
              <EventStatCard title="Cadastros" value={totalCadastros} />
              <EventStatCard title="Acessos" value={totalAcessos} />
              <EventStatCard title="Downloads" value={"--"} />
              <div
                onClick={() => setIsUserModalOpen(true)}
                className="cursor-pointer"
              >
                <EventStatCard title="Lista de Cadastros" value={"Ver"} />
              </div>
            </div>

            {/* ✅ Seção de Download de Fotos Funcional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link para download de todas as fotos
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    downloadLink ||
                    (isGenerating
                      ? "Gerando link, por favor aguarde..."
                      : "Clique em Gerar para criar o link")
                  }
                  className="flex-1 text-black bg-gray-100 border-gray-300 rounded-md shadow-sm text-sm p-2"
                />
                <button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 text-sm disabled:bg-gray-400 disabled:cursor-wait"
                >
                  {isGenerating ? "GERANDO..." : "GERAR"}
                </button>
                <button
                  onClick={handleCopyLink}
                  disabled={!downloadLink || isGenerating}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 text-sm disabled:bg-gray-300 disabled:text-gray-400"
                >
                  {copyButtonText}
                </button>
              </div>
              {downloadLink && (
                <p className="text-xs text-orange-600 mt-1">
                  Atenção: O link é temporário e expira em 1 hora.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Renderização dos Modais */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        onUpdated={onRefreshed}
      />
      <UserListModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        eventSlug={event.slug}
      />
    </>
  );
}
