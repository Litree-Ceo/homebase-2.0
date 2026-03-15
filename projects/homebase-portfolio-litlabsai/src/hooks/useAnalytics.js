import { useState, useEffect } from 'react';
import { useProjects } from './useProjects';

export const useAnalytics = () => {
  const { projects, loading } = useProjects();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    projectsByTag: {},
  });

  useEffect(() => {
    if (!loading) {
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'Active').length;
      const completedProjects = projects.filter(p => p.status === 'Completed').length;
      
      const projectsByTag = projects.reduce((acc, project) => {
        project.tags?.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {});

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStats({ totalProjects, activeProjects, completedProjects, projectsByTag });
    }
  }, [projects, loading]);

  return { stats, loading };
};

export default useAnalytics;
