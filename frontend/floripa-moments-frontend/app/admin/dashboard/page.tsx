"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

import CreateEventForm from "@/components/events/CreateEventForm";
import UploadPhotosForm from "@/components/events/UploadPhotosForm";

import {
  MagnifyingGlassIcon,
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
import CreatePhotographerForm from "@/components/events/CreatePhotographerForm";

// --- Tipos ---
interface Event {
  slug: string;
  title: string;
}

interface Metric {
  id: string;
  user_id: string | null;
  user_name?: string | null;
  event_slug: string | null;
  type: string;
  count: number;
  created_at: string;
}

// --- Componentes Reutilizáveis ---
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

// --- Dashboard ---
export default function AdminDashboardPage() {
  const router = useRouter();

  // --- Estados ---
  const [events, setEvents] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<
    "1h" | "3h" | "5h" | "8h" | "10h" | "12h" | "24h" | "3D" | "7D"
  >("1h");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "PHOTOGRAPHER",
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMsg, setUserMsg] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  // --- Logout ---
  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_token_jti");
      router.push("/admin/login");
    }
  };

  // --- Buscar username por ID (cache para otimizar múltiplas chamadas) ---
  const fetchUserNames = useCallback(async (userIds: string[]) => {
    const token = localStorage.getItem("admin_token") || "";
    const cache: Record<string, string> = {};
    await Promise.all(
      userIds.map(async (id) => {
        try {
          const res = await fetch(`${API_URL}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const user = await res.json();
            cache[id] = user.name || "Anônimo";
            cache[id] =
              user.name + (user.last_name ? ` ${user.last_name}` : "");
          } else {
            cache[id] = "Anônimo";
          }
        } catch {
          cache[id] = "Anônimo";
        }
      })
    );
    return cache;
  }, []);

  // --- Fetch de dados ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push(`/admin/login`);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [eventsRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/admin/events`, { headers }),
        fetch(`${API_URL}/admin/metrics`, { headers }),
      ]);

      if (eventsRes.status === 401 || metricsRes.status === 401) {
        handleLogout();
        return;
      }

      setEvents(await eventsRes.json());

      const metricsData: Metric[] = await metricsRes.json();

      // --- Buscar nomes apenas para IDs únicos ---
      const userIds = Array.from(
        new Set(metricsData.filter((m) => m.user_id).map((m) => m.user_id!))
      );
      const userNamesMap = await fetchUserNames(userIds);

      const metricsWithNames = metricsData.map((m) => ({
        ...m,
        user_name: m.user_id ? userNamesMap[m.user_id] : "Anônimo",
      }));

      setMetrics(
        metricsWithNames.filter((m) => ["search", "register"].includes(m.type))
      );
    } catch (err) {
      console.error(err);
      setEvents([]);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  }, [router, fetchUserNames]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Criar usuário ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMsg(null);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!res.ok)
        throw new Error((await res.json()).detail || "Erro ao criar usuário");

      setUserMsg({ text: "Usuário criado com sucesso!", ok: true });
      setNewUser({ name: "", email: "", password: "", role: "user" });
      fetchAllData();
    } catch (err: unknown) {
      if (err instanceof Error) setUserMsg({ text: err.message, ok: false });
      else setUserMsg({ text: "Erro inesperado", ok: false });
    } finally {
      setCreatingUser(false);
    }
  };

  // --- Métricas totais ---
  const { totalSearches, totalRegisters } = useMemo(
    () => ({
      totalSearches: metrics
        .filter((m) => m.type === "search")
        .reduce((sum, m) => sum + m.count, 0),
      totalRegisters: metrics
        .filter((m) => m.type === "register")
        .reduce((sum, m) => sum + m.count, 0),
    }),
    [metrics]
  );

  // --- Limite de tempo ---
  const getTimeLimit = () => {
    const now = new Date();
    switch (timeRange) {
      case "1h":
        return new Date(now.getTime() - 1 * 60 * 60 * 1000);
      case "3h":
        return new Date(now.getTime() - 3 * 60 * 60 * 1000);
      case "5h":
        return new Date(now.getTime() - 5 * 60 * 60 * 1000);
      case "8h":
        return new Date(now.getTime() - 8 * 60 * 60 * 1000);
      case "10h":
        return new Date(now.getTime() - 10 * 60 * 60 * 1000);
      case "12h":
        return new Date(now.getTime() - 12 * 60 * 60 * 1000);
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "3D":
        return subDays(now, 3);
      case "7D":
        return subDays(now, 7);
      default:
        return new Date(now.getTime() - 1 * 60 * 60 * 1000);
    }
  };

  // --- Dados do gráfico de atividade ---
  const activityChartData = useMemo(() => {
    const limitDate = getTimeLimit();
    const filteredMetrics = metrics.filter(
      (m) => parseISO(m.created_at) >= limitDate
    );

    const groupedData = filteredMetrics.reduce((acc, metric) => {
      const metricDate = parseISO(metric.created_at);
      const isHourRange = [
        "1h",
        "3h",
        "5h",
        "8h",
        "10h",
        "12h",
        "24h",
      ].includes(timeRange);
      const dayKey = isHourRange
        ? format(metricDate, "HH:mm")
        : format(metricDate, "dd/MM");

      if (!acc[dayKey])
        acc[dayKey] = { day: dayKey, searches: 0, registers: 0 };

      if (metric.type === "search") acc[dayKey].searches += metric.count;
      if (metric.type === "register") acc[dayKey].registers += metric.count;

      return acc;
    }, {} as Record<string, { day: string; searches: number; registers: number }>);

    return Object.values(groupedData).sort((a, b) => {
      const aMetric = filteredMetrics.find(
        (m) =>
          (["1h", "3h", "5h", "8h", "10h", "12h", "24h"].includes(timeRange)
            ? format(parseISO(m.created_at), "HH:mm")
            : format(parseISO(m.created_at), "dd/MM")) === a.day
      )!;
      const bMetric = filteredMetrics.find(
        (m) =>
          (["1h", "3h", "5h", "8h", "10h", "12h", "24h"].includes(timeRange)
            ? format(parseISO(m.created_at), "HH:mm")
            : format(parseISO(m.created_at), "dd/MM")) === b.day
      )!;
      return (
        parseISO(aMetric.created_at).getTime() -
        parseISO(bMetric.created_at).getTime()
      );
    });
  }, [metrics, timeRange]);

  // --- Top 5 eventos por engajamento ---
  const eventPerformanceData = useMemo(() => {
    const performance = metrics.reduce((acc, metric) => {
      const slug = metric.event_slug || "N/A";
      if (!acc[slug])
        acc[slug] = {
          name: events.find((e) => e.slug === slug)?.title || slug,
          searches: 0,
        };
      if (metric.type === "search") acc[slug].searches += metric.count;
      return acc;
    }, {} as Record<string, { name: string; searches: number }>);

    return Object.values(performance)
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 5);
  }, [metrics, events]);

  // --- Métricas por usuário ---
  const userMetrics = useMemo(() => {
    const grouped: Record<string, { searches: number; registers: number }> = {};
    metrics.forEach((m) => {
      const user = m.user_name || m.user_id || "Anônimo";
      if (!grouped[user]) grouped[user] = { searches: 0, registers: 0 };
      if (m.type === "search") grouped[user].searches += m.count;
      if (m.type === "register") grouped[user].registers += m.count;
    });
    return Object.entries(grouped).map(([user, data]) => ({ user, ...data }));
  }, [metrics]);

  // --- Loading ---
  if (loading) return <LoadingSpinner />;

  return (
    <main className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
          >
            <PowerIcon className="h-5 w-5" /> Sair
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          {/* Atividade na Plataforma */}
          <section className="lg:col-span-3 bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Atividade na Plataforma
              </h2>
              <div className="flex space-x-2">
                {["1h", "3h", "5h", "8h", "10h", "12h", "24h", "3D", "7D"].map(
                  (range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range as typeof timeRange)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        timeRange === range
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {range}
                    </button>
                  )
                )}
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

          {/* Top 5 Eventos */}
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
                    width={120}
                    fontSize={12}
                    tick={{ fill: "#6b7280" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(243,244,246,0.5)" }}
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Métricas por Usuário */}
        <section className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Métricas por Usuário
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Usuário
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Pesquisas
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Cadastros
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userMetrics.map((u) => (
                  <tr key={u.user} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {u.user}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {u.searches}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {u.registers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Criar Novo Evento
            </h2>
            <CreateEventForm onCreated={fetchAllData} />
          </section>
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Upload de Fotos
            </h2>
            <UploadPhotosForm
              events={events}
              userRole="ADMIN"
              onUploaded={fetchAllData}
            />
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Criar Novo Fotógrafo
            </h2>
            <CreatePhotographerForm events={events} />
          </section>
        </div>
      </div>
    </main>
  );
}
