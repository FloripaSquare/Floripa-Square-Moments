"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import MetricsChart, { Metric } from "@/components/metrics/MetricsChart";
import CreateEventForm from "@/components/events/CreateEventForm";
import UploadPhotosForm from "@/components/events/UploadPhotosForm";

interface Event {
  slug: string;
  title: string;
  privacy_url?: string;
}

interface LogItem {
  id: string;
  user_id: string;
  action: string;
  count: number;
  created_at: string;
}

interface AggregatedMetrics {
  register: number;
  register_admin: number;
  search: number;
  download_photos: number;
}

// Função para agrupar métricas
function aggregateMetrics(logs: LogItem[]): AggregatedMetrics {
  return logs.reduce(
    (acc, log) => {
      if (log.action in acc) {
        acc[log.action as keyof AggregatedMetrics] += log.count;
      }
      return acc;
    },
    {
      register: 0,
      register_admin: 0,
      search: 0,
      download_photos: 0,
    }
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      const [logsRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/metrics/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/events/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const logsData: LogItem[] = await logsRes.json();
      const eventsData: Event[] = await eventsRes.json();

      // Agrupa as métricas
      const aggregated = aggregateMetrics(logsData);

      // Monta o array para o MetricsChart
      const chartMetrics: Metric[] = [
        {
          name: "Cadastros",
          value: aggregated.register + aggregated.register_admin,
        },
        { name: "Buscas", value: aggregated.search },
        { name: "Downloads", value: aggregated.download_photos },
      ];

      setMetrics(chartMetrics);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      console.error(err);
      setMetrics([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Carregando dados...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold">Painel do Administrador</h1>

      {/* Gráfico de métricas */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Métricas</h2>
        <MetricsChart metrics={metrics} />
      </section>

      {/* Formulário de criação de evento */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Criar Evento</h2>
        <CreateEventForm onCreated={fetchData} />
      </section>

      {/* Formulário de upload de fotos */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload de Fotos</h2>
        <UploadPhotosForm events={events} onUploaded={fetchData} />
      </section>
    </main>
  );
}
