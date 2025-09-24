"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

// Supondo que estes componentes existam nos caminhos especificados
import CreateEventForm from "@/components/events/CreateEventForm";
import UploadPhotosForm from "@/components/events/UploadPhotosForm";
//import ActiveSessions from "@/components/admin/ActiveSessions";

import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  UserPlusIcon,
  ArrowPathIcon,
  PowerIcon,
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
import { subDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- Tipos ---
interface Event {
  slug: string;
  title: string;
}
interface Metric {
  id: string;
  user_id: string | null;
  event_slug: string | null;
  type: "search" | "download_photos" | "register";
  count: number; // ✨ Tipo ajustado
  created_at: string;
}

// --- Componente Reutilizável para Cards de KPI ---
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

// --- Página Principal do Dashboard ---
export default function AdminDashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7);

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_token_jti");
      router.push("/admin/login");
    }
  };

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [eventsRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/admin/events`, { headers }),
        fetch(`${API_URL}/admin/metrics`, { headers }),
      ]);

      if (eventsRes.status === 401 || metricsRes.status === 401) {
        // Token inválido, força o logout
        handleLogout();
        return;
      }

      const eventsData = await eventsRes.json();
      setEvents(Array.isArray(eventsData) ? eventsData : []);

      const metricsData = await metricsRes.json();
      setMetrics(Array.isArray(metricsData) ? metricsData : []);
    } catch (err) {
      console.error("Falha ao buscar dados do dashboard:", err);
      setEvents([]);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { totalSearches, totalDownloads, totalRegisters } = useMemo(() => {
    return {
      // ✨ Lógica ajustada para somar o 'count'
      totalSearches: metrics
        .filter((m) => m.type === "search")
        .reduce((sum, m) => sum + m.count, 0),
      totalDownloads: metrics
        .filter((m) => m.type === "download_photos")
        .reduce((sum, m) => sum + m.count, 0),
      totalRegisters: metrics
        .filter((m) => m.type === "register")
        .reduce((sum, m) => sum + m.count, 0),
    };
  }, [metrics]);

  const activityChartData = useMemo(() => {
    const filteredMetrics = metrics.filter((m) => {
      const metricDate = parseISO(m.created_at);
      return metricDate >= subDays(new Date(), dateRange);
    });

    const groupedData = filteredMetrics.reduce((acc, metric) => {
      const day = format(parseISO(metric.created_at), "dd/MM", {
        locale: ptBR,
      });
      if (!acc[day]) {
        acc[day] = { day, searches: 0, downloads: 0, registers: 0 };
      }
      // ✨ Lógica ajustada para somar o 'count'
      if (metric.type === "search") acc[day].searches += metric.count;
      if (metric.type === "download_photos") acc[day].downloads += metric.count;
      if (metric.type === "register") acc[day].registers += metric.count;
      return acc;
    }, {} as Record<string, { day: string; searches: number; downloads: number; registers: number }>);

    const chartData = [];
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayKey = format(date, "dd/MM", { locale: ptBR });
      chartData.push(
        groupedData[dayKey] || {
          day: dayKey,
          searches: 0,
          downloads: 0,
          registers: 0,
        }
      );
    }
    return chartData;
  }, [metrics, dateRange]);

  const eventPerformanceData = useMemo(() => {
    const performance = metrics.reduce((acc, metric) => {
      const slug = metric.event_slug || "N/A";
      if (!acc[slug]) {
        acc[slug] = {
          name: events.find((e) => e.slug === slug)?.title || slug,
          searches: 0,
          downloads: 0,
        };
      }
      // ✨ Lógica ajustada para somar o 'count'
      if (metric.type === "search") acc[slug].searches += metric.count;
      if (metric.type === "download_photos")
        acc[slug].downloads += metric.count;
      return acc;
    }, {} as Record<string, { name: string; searches: number; downloads: number }>);

    return Object.values(performance)
      .sort((a, b) => b.searches + b.downloads - (a.searches + a.downloads))
      .slice(0, 5);
  }, [metrics, events]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-600 mt-4 text-lg">Carregando dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Painel do Administrador
            </h1>
            <p className="text-gray-500 mt-1">
              Métricas e gerenciamento de eventos.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg shadow-sm hover:bg-red-200 transition-colors"
            title="Sair da sua sessão atual"
          >
            <PowerIcon className="h-5 w-5" />
            Sair
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <StatCard
            title="Total de Pesquisas"
            value={totalSearches}
            icon={MagnifyingGlassIcon}
          />
          <StatCard
            title="Total de Downloads"
            value={totalDownloads}
            icon={ArrowDownTrayIcon}
          />
          <StatCard
            title="Total de Cadastros"
            value={totalRegisters}
            icon={UserPlusIcon}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          <section className="lg:col-span-3 bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Atividade na Plataforma
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDateRange(7)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRange === 7
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setDateRange(30)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRange === 30
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="day"
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
                    dataKey="downloads"
                    name="Downloads"
                    stroke="#10b981"
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
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Top 5 Eventos por Engajamento
            </h2>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={eventPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    fontSize={12}
                    tick={{ fill: "#6b7280" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(243, 244, 246, 0.5)" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "14px" }} />
                  <Bar
                    dataKey="searches"
                    name="Pesquisas"
                    stackId="a"
                    fill="#3b82f6"
                  />
                  <Bar
                    dataKey="downloads"
                    name="Downloads"
                    stackId="a"
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="mt-8">{/* <ActiveSessions /> */}</section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Criar Novo Evento
            </h2>
            <CreateEventForm onCreated={fetchAllData} />
          </section>
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Upload de Fotos para Evento
            </h2>
            <UploadPhotosForm events={events} onUploaded={fetchAllData} />
          </section>
        </div>
      </div>
    </main>
  );
}
