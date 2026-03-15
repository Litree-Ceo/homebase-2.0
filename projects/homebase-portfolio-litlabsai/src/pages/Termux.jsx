import Terminal from '../components/Terminal';
import { useProjects } from '../hooks/useProjects';
import Loader from '../components/Loader';

const Termux = () => {
  const { projects, loading } = useProjects();

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <Terminal projects={projects} />
    </div>
  );
};

export default Termux;
