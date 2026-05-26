import { useCallback, useEffect, useState } from 'react';
import Loading from '../common/Loading';
import AdminStats from '../dashboard/AdminStats';
import { buildOverviewStats, buildReportStats } from '../../utils/adminStatsBuilders';
import { getDashboardStats } from '../../services/adminService';

export default function AdminOverviewPanel({ variant = 'overview', onFeedback }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await getDashboardStats());
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading label="Cargando estadísticas…" />;

  const cards = variant === 'reports' ? buildReportStats(stats) : buildOverviewStats(stats);

  return <AdminStats stats={cards} />;
}
