 
import { motion } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import Loader from '../components/Loader';

const Analytics = () => {
  const { stats, loading } = useAnalytics();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="analytics-container">
      <header className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">An overview of your project landscape</p>
      </header>

      <div className="stats-grid">
        <motion.div className="aurora-card stat-card">
          <h3>Total Projects</h3>
          <p>{stats.totalProjects}</p>
        </motion.div>
        <motion.div className="aurora-card stat-card">
          <h3>Active Projects</h3>
          <p>{stats.activeProjects}</p>
        </motion.div>
        <motion.div className="aurora-card stat-card">
          <h3>Completed Projects</h3>
          <p>{stats.completedProjects}</p>
        </motion.div>
      </div>

      <div className="aurora-card chart-card">
        <h3>Projects by Tag</h3>
        {Object.entries(stats.projectsByTag).map(([tag, count]) => (
          <div key={tag} className="chart-bar">
            <span className="chart-label">{tag}</span>
            <div className="chart-value" style={{ width: `${stats.totalProjects > 0 ? (count / stats.totalProjects) * 100 : 0}%` }}>
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
