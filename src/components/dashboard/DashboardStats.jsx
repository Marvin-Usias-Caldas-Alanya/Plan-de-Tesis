import Card from '../common/Card';
import './DashboardStats.css';

export default function DashboardStats({ stats = [] }) {
  return (
    <div className="dashboard-stats">
      {stats.map((stat) => (
        <Card key={stat.label} elevated className="dashboard-stats__item">
          <span className="dashboard-stats__label">{stat.label}</span>
          <span className="dashboard-stats__value">{stat.value}</span>
          {stat.hint && <span className="dashboard-stats__hint">{stat.hint}</span>}
        </Card>
      ))}
    </div>
  );
}
