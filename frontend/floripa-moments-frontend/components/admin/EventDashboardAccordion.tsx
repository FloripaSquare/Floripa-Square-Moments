/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { API_URL } from "@/lib/api";

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

interface UserActivityMetric {
  event_slug: string | null;
  user_name: string;
  last_name?: string | null;
  email: string;
  instagram?: string | null;
  whatsapp?: string | null;
  pesquisas: number;
  cadastros: number;
  downloads: number;
}

interface Props {
  event: Event;
  metrics: UserActivityMetric[];
  onRefreshed: () => void;
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
  const [isUserModalLoading, setIsUserModalLoading] = useState(false);
  const [modalMetrics, setModalMetrics] = useState<UserActivityMetric[]>([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [downloadPassword, setDownloadPassword] = useState("");
  // ✅ ADICIONADA VARIÁVEL DE ESTADO PARA A DATA DE EXPIRAÇÃO
  const [downloadExpiration, setDownloadExpiration] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("COPIAR");

  // Cálculos de métricas (sem alteração)
  const eventMetrics = metrics.filter((m) => m.event_slug === event.slug);
  const totalCadastros = eventMetrics.reduce((sum, m) => sum + m.cadastros, 0);
  const totalAcessos = eventMetrics.reduce((sum, m) => sum + m.pesquisas, 0);
  const totalDownloads = eventMetrics.reduce((sum, m) => sum + m.downloads, 0);

  // Formatação de data e hora (sem alteração)
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

  // Função para buscar os dados detalhados para o modal de usuários
  const handleOpenUserModal = async () => {
    setIsUserModalOpen(true);
    setIsUserModalLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/events/${event.slug}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Resposta da API de métricas:", res);
      if (!res.ok) throw new Error("Falha ao buscar dados dos usuários.");
      const data = await res.json();
      setModalMetrics(data);
    } catch (error) {
      console.error(error);
      alert("Não foi possível carregar os detalhes dos usuários.");
      setIsUserModalOpen(false); // Fecha o modal em caso de erro
    } finally {
      setIsUserModalLoading(false);
    }
  };

  // ✅ LÓGICA DE GERAR LINK CORRIGIDA: Capturando a data de expiração
  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setDownloadLink("");
    setDownloadPassword(""); // Limpar password anterior
    setDownloadExpiration(""); // Limpar expiration anterior
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${API_URL}/admin/events/${event.slug}/generate-download-link`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Falha ao gerar o link.");
      }
      const data = await res.json();
      setDownloadLink(data.url);
      setDownloadPassword(data.password);
      setDownloadExpiration(data.expires_at); // 👈 CAPTURANDO O DADO
    } catch (error: any) {
      console.error(error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ LÓGICA DE COPIAR LINK RESTAURADA
  const handleCopyLink = () => {
    if (!downloadLink) return;
    navigator.clipboard.writeText(downloadLink).then(() => {
      setCopyButtonText("COPIADO!");
      setTimeout(() => setCopyButtonText("COPIAR"), 2000);
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <EventStatCard
                title="Participantes"
                value={event.participants_count ?? "--"}
              />
              <EventStatCard title="Cadastros" value={totalCadastros} />
              <EventStatCard title="Acessos" value={totalAcessos} />
              <EventStatCard title="Downloads" value={totalDownloads} />
              <div onClick={handleOpenUserModal} className="cursor-pointer">
                <EventStatCard title="Lista de Cadastros" value={"Ver"} />
              </div>
            </div>

            {/* ✅ Seção de Download de Fotos com a lógica restaurada */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">
                Download de Todas as Fotos (.zip)
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-wait"
                >
                  {isGenerating ? "Gerando..." : "Gerar Link"}
                </button>
                {downloadLink && (
                  <div className="space-y-2">
                    <div className="flex-grow flex items-center bg-white border rounded-md p-1">
                      <input
                        type="text"
                        value={downloadLink}
                        readOnly
                        className="w-full text-sm text-gray-600 p-1 border-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1 text-xs font-bold text-white bg-gray-600 rounded hover:bg-gray-700"
                      >
                        {copyButtonText}
                      </button>
                    </div>

                    <p className="text-sm">
                      <strong>Senha:</strong>
                      <span className="font-mono bg-gray-100 p-1 rounded">
                        {downloadPassword}
                      </span>
                    </p>
                    {/* 👇 EXIBINDO A VALIDADE */}
                    {downloadExpiration && (
                      <p className="text-xs text-gray-500">
                        Válido até:{" "}
                        {new Date(downloadExpiration).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                )}
              </div>
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
        isLoading={isUserModalLoading}
        onClose={() => setIsUserModalOpen(false)}
        metrics={modalMetrics}
        eventSlug={event.slug}
      />
    </>
  );
}
