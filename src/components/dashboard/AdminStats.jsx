import DashboardStats from './DashboardStats';

/** Tarjetas KPI reutilizables en resumen y reportes. */
export default function AdminStats({ stats = [] }) {
  if (!stats.length) return null;
  return <DashboardStats stats={stats} />;
}
