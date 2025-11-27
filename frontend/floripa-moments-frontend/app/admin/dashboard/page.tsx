"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  ArrowPathIcon,
  PowerIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { subHours, subDays, format, parseISO } from "date-fns";
import PhotoManager from "@/components/PhotoManager";
import EventCommentsList from "@/components/events/EventCommentList";

// Componentes e Ícones (importações originais omitidas para brevidade)
import CreateEventForm from "@/components/events/CreateEventForm";
import UploadPhotosForm from "@/components/events/UploadPhotosForm";
import CreatePhotographerForm from "@/components/events/CreatePhotographerForm";
import EventDashboardAccordion from "@/components/admin/EventDashboardAccordion";
import UploadMediaForm from "@/components/events/UploadMediaForm";
import MediaManager from "@/components/MediaManager";

// --- Tipos de Dados ---

interface Event {
  slug: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
}

interface AggregatedMetric {
  event_slug: string | null;
  user_name: string;
  email: string;
  instagram?: string | null;
  whatsapp?: string | null;
  pesquisas: number;
  cadastros: number;
  downloads: number;
}

interface RawMetric {
  type: "search" | "register" | "download_photo" | "upload_media";
  count: number;
  created_at: string;
}

interface MediaItem {
  id: string;
  s3_url: string;
  type?: "image" | "video"; // opcional
}

// --- Definição dos Intervalos de FILTRO para o GRÁFICO ---
// O valor é o número de milissegundos a subtrair de "agora"
const CHART_TIME_RANGES = {
  "5 min": 5 * 60 * 1000,
  "30 min": 30 * 60 * 1000,
  "1 hora": 60 * 60 * 1000,
  "4 horas": 4 * 60 * 60 * 1000,
  "6 horas": 6 * 60 * 60 * 1000,
  "8 horas": 8 * 60 * 60 * 1000,
  "24 horas": 24 * 60 * 60 * 1000,
  "3 dias": 3 * 24 * 60 * 60 * 1000,
} as const;

type ChartTimeRangeKey = keyof typeof CHART_TIME_RANGES;

// --- Definição dos Intervalos de ATUALIZAÇÃO (Polling) ---
const REFRESH_OPTIONS = {
  Manual: 0,
  "5 min": 5 * 60 * 1000,
  "30 min": 30 * 60 * 1000,
  "1 hora": 60 * 60 * 1000,
  "4 horas": 4 * 60 * 60 * 1000,
  "6 horas": 6 * 60 * 60 * 1000,
  "8 horas": 8 * 60 * 60 * 1000,
  "24 horas": 24 * 60 * 60 * 1000,
  "3 dias": 3 * 24 * 60 * 60 * 1000,
} as const;

type RefreshIntervalKey = keyof typeof REFRESH_OPTIONS;

// --- Componentes Reutilizáveis (inalterados) ---
function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow transition-transform hover:scale-105">
      <div className="flex items-center">
        <div className="bg-blue-100 p-3 rounded-full">
          <Icon className="h-7 w-7 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800">
            {value.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
        <p className="text-gray-600 mt-4 text-lg">Carregando dashboard...</p>
      </div>
    </main>
  );
}

// --- Componente Principal do Dashboard ---
export default function AdminDashboardPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedMediaEventSlug, setSelectedMediaEventSlug] =
    useState<string>("");

  const [aggregatedMetrics, setAggregatedMetrics] = useState<
    AggregatedMetric[]
  >([]);
  const [activityMetrics, setActivityMetrics] = useState<RawMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>("");

  // Polling Interval (Mantido)
  const [refreshInterval, setRefreshInterval] =
    useState<RefreshIntervalKey>("30 min");

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // 💥 ATUALIZADO: Estado do Filtro do GRÁFICO
  const [timeRange, setTimeRange] = useState<ChartTimeRangeKey>("24 horas");

  const handleLogout = useCallback(() => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("admin_token");
      router.push("/admin/login");
    }
  }, [router]);

  const fetchEventMedia = useCallback(async (eventSlug: string) => {
    if (!eventSlug) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/photos/${eventSlug}/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMediaItems(Array.isArray(data) ? data : []);
      } else {
        setMediaItems([]);
        console.error("Falha ao carregar mídias do evento", res.status);
      }
    } catch (err) {
      console.error("Erro ao buscar mídias:", err);
      setMediaItems([]);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    if (loading) setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push(`/admin/login`);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [eventsRes, aggregatedMetricsRes, activityMetricsRes] =
        await Promise.all([
          fetch(`${API_URL}/admin/events`, { headers }),
          fetch(`${API_URL}/admin/metrics`, { headers }),
          fetch(`${API_URL}/admin/metrics/activity`, { headers }),
        ]);

      if (
        [eventsRes, aggregatedMetricsRes, activityMetricsRes].some(
          (res) => res.status === 401
        )
      ) {
        handleLogout();
        return;
      }

      const eventsData = await eventsRes.json();
      const aggregatedData = await aggregatedMetricsRes.json();
      const activityData = await activityMetricsRes.json();

      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setAggregatedMetrics(Array.isArray(aggregatedData) ? aggregatedData : []);
      setActivityMetrics(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      console.error("Falha ao buscar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [router, handleLogout, loading]);

  // Efeito para a primeira carga dos dados
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Efeito para o Polling (Atualização Automática)
  useEffect(() => {
    const intervalMs = REFRESH_OPTIONS[refreshInterval];

    if (intervalMs > 0) {
      const intervalId = setInterval(() => {
        fetchAllData();
      }, intervalMs);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchAllData]);

  // Cálculos Memoizados (inalterados)
  const { totalSearches, totalRegisters, totalDownloads } = useMemo(
    () => ({
      totalSearches: aggregatedMetrics.reduce((sum, m) => sum + m.pesquisas, 0),
      totalRegisters: aggregatedMetrics.reduce(
        (sum, m) => sum + m.cadastros,
        0
      ),
      totalDownloads: aggregatedMetrics.reduce(
        (sum, m) => sum + m.downloads,
        0
      ),
    }),
    [aggregatedMetrics]
  );

  const eventPerformanceData = useMemo(() => {
    const performance: Record<string, { name: string; searches: number }> = {};
    aggregatedMetrics.forEach((metric) => {
      if (metric.event_slug) {
        if (!performance[metric.event_slug]) {
          performance[metric.event_slug] = {
            name:
              events.find((e) => e.slug === metric.event_slug)?.title ||
              metric.event_slug,
            searches: 0,
          };
        }
        performance[metric.event_slug].searches += metric.pesquisas;
      }
    });
    return Object.values(performance)
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 5);
  }, [aggregatedMetrics, events]);

  const userMetrics = useMemo(() => {
    const metricsByUser: Record<
      string,
      { user: string; searches: number; registers: number }
    > = {};
    aggregatedMetrics.forEach((metric) => {
      const userName = metric.user_name || "Anônimo";
      if (!metricsByUser[userName]) {
        metricsByUser[userName] = { user: userName, searches: 0, registers: 0 };
      }
      metricsByUser[userName].searches += metric.pesquisas;
      metricsByUser[userName].registers += metric.cadastros;
    });
    return Object.values(metricsByUser).sort(
      (a, b) => b.searches + b.registers - (a.searches + a.registers)
    );
  }, [aggregatedMetrics]);

  // 💥 ATUALIZADO: Lógica do gráfico para novos intervalos
  const activityChartData = useMemo(() => {
    const limitMs = CHART_TIME_RANGES[timeRange];
    const limitDate = new Date(new Date().getTime() - limitMs);

    const filteredMetrics = activityMetrics.filter(
      (m) => parseISO(m.created_at) >= limitDate
    );

    const isDayRange = limitMs >= 24 * 60 * 60 * 1000; // 24 horas ou mais

    const groupedData = filteredMetrics.reduce((acc, metric) => {
      const metricDate = parseISO(metric.created_at);
      const key = isDayRange
        ? format(metricDate, "dd/MM") // Agrupa por dia
        : format(metricDate, "HH:mm"); // Agrupa por hora/minuto

      if (!acc[key]) {
        acc[key] = {
          time: key,
          searches: 0,
          registers: 0,
          downloads: 0,
          uploads: 0,
          date: metricDate,
        };
      }

      if (metric.type === "search") acc[key].searches += metric.count;
      if (metric.type === "register") acc[key].registers += metric.count;
      if (metric.type === "download_photo") acc[key].downloads += metric.count;
      if (metric.type === "upload_media") acc[key].uploads += metric.count;

      return acc;
    }, {} as Record<string, { time: string; searches: number; registers: number; downloads: number; uploads: number; date: Date }>);

    return Object.values(groupedData).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [activityMetrics, timeRange]);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Painel do Administrador
            </h1>
            <p className="text-gray-500 mt-1">
              Métricas e gerenciamento de eventos.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            {/* Seletor de Intervalo de Atualização (Polling) */}
            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                Atualizar a cada:
              </span>
              <select
                value={refreshInterval}
                onChange={(e) =>
                  setRefreshInterval(e.target.value as RefreshIntervalKey)
                }
                className="p-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.keys(REFRESH_OPTIONS).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            {/* Botão de Atualização Manual */}
            <button
              onClick={fetchAllData}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full transition-colors"
              disabled={loading}
            >
              <ArrowPathIcon
                className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg shadow-sm hover:bg-red-200 transition-colors"
            >
              <PowerIcon className="h-5 w-5" /> Sair
            </button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <StatCard
            title="Total de Pesquisas"
            value={totalSearches}
            icon={MagnifyingGlassIcon}
          />
          <StatCard
            title="Total de Cadastros"
            value={totalRegisters}
            icon={UserPlusIcon}
          />
          <StatCard
            title="Total de Downloads"
            value={totalDownloads}
            icon={ArrowDownTrayIcon}
          />
        </div>
        {/* Dashboards por Evento */}
        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Painel de Eventos
          </h2>
          {events.length > 0 ? (
            events.map((event) => (
              <EventDashboardAccordion
                key={event.slug}
                event={event}
                onRefreshed={fetchAllData}
                metrics={aggregatedMetrics}
              />
            ))
          ) : (
            <p className="text-gray-500">Nenhum evento encontrado.</p>
          )}
        </section>
        <PhotoManager userRole="ADMIN" />
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          {/* Atividade na Plataforma (ÁREA CORRIGIDA) */}
          <section className="lg:col-span-3 bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Atividade na Plataforma
              </h2>
              <div className="flex flex-wrap gap-2">
                {/* 💥 Botões de Filtro do GRÁFICO (Novos Intervalos) */}
                {Object.keys(CHART_TIME_RANGES).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as ChartTimeRangeKey)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeRange === range
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="time"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis tick={{ fill: "#6b7280" }} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Line
                  type="monotone"
                  dataKey="searches"
                  name="Pesquisas"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="registers"
                  name="Cadastros"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  name="Downloads"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="uploads"
                  name="Uploads"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Top 5 Eventos */}
          <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Top 5 Eventos (por pesquisas)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={eventPerformanceData}
                layout="vertical"
                margin={{ right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: "#6b7280" }} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: "rgba(243,244,246,0.5)" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                  }}
                />
                <Bar dataKey="searches" name="Pesquisas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>
        {/* Métricas por Usuário */}
        <section className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Métricas por Usuário
          </h2>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pesquisas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastros
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userMetrics.map(({ user, searches, registers }) => (
                  <tr key={user} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {searches}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {registers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* Comentários por Evento */}
        <section className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Comentários por Evento
          </h2>

          <div className="mb-4">
            <label
              htmlFor="eventSelect"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Selecione um evento:
            </label>
            <select
              id="eventSelect"
              value={selectedEventSlug}
              onChange={(e) => setSelectedEventSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Escolha um evento --</option>
              {events.map((event) => (
                <option key={event.slug} value={event.slug}>
                  {event.title} ({event.slug})
                </option>
              ))}
            </select>
          </div>

          {selectedEventSlug ? (
            <EventCommentsList eventSlug={selectedEventSlug} />
          ) : (
            <p className="text-gray-500 text-sm mt-4">
              Selecione um evento para visualizar os comentários.
            </p>
          )}
        </section>

        {/* Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <section className="bg-white p-6 rounded-xl shadow lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Criar Evento
            </h2>
            <CreateEventForm onCreated={fetchAllData} />
          </section>
          <section className="bg-white p-6 rounded-xl shadow lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Criar Fotógrafo
            </h2>
            <CreatePhotographerForm events={events} />
          </section>
          <section className="bg-white p-6 rounded-xl shadow lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Upload de Fotos
            </h2>
            <UploadPhotosForm
              events={events}
              userRole="ADMIN"
              onUploaded={fetchAllData}
            />
          </section>
          <section className="bg-white p-6 rounded-xl shadow lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Upload de Mídia
            </h2>

            <div className="mb-4">
              <label
                htmlFor="mediaEventSelect"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Selecione um evento:
              </label>
              <select
                id="mediaEventSelect"
                value={selectedMediaEventSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  setSelectedMediaEventSlug(slug);
                  fetchEventMedia(slug); // ⬅️ busca mídias aqui
                }}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Escolha um evento --</option>
                {events.map((event) => (
                  <option key={event.slug} value={event.slug}>
                    {event.title} ({event.slug})
                  </option>
                ))}
              </select>
            </div>

            {selectedMediaEventSlug ? (
              <>
                <UploadMediaForm
                  events={[
                    {
                      slug: selectedMediaEventSlug,
                      title: selectedMediaEventSlug,
                    },
                  ]}
                  onUploaded={() => fetchAllData()}
                />
                <div className="mt-6">
                  <MediaManager
                    mediaItems={mediaItems}
                    onDelete={async (id) => {
                      await fetch(`${API_URL}/photos/media/${id}`, {
                        method: "DELETE",
                      });

                      // remove do estado local
                      setMediaItems((prev) => prev.filter((m) => m.id !== id));
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-500">
                Selecione um evento para enviar mídias.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
