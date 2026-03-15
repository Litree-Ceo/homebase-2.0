import { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const ProjectForm = ({ project, onSave }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(project ? project.title : '');
  const [description, setDescription] = useState(project ? project.description : '');
  const [tech, setTech] = useState(project ? project.tech.join(', ') : '');
  const [liveUrl, setLiveUrl] = useState(project ? project.liveUrl : '');
  const [repoUrl, setRepoUrl] = useState(project ? project.repoUrl : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectData = {
      title,
      description,
      tech: tech.split(',').map(t => t.trim()),
      liveUrl,
      repoUrl,
      userId: user.uid,
    };

    if (project) {
      await updateDoc(doc(db, 'projects', project.id), projectData);
    } else {
      await addDoc(collection(db, 'projects'), projectData);
    }

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input type="text" placeholder="Technologies (comma-separated)" value={tech} onChange={(e) => setTech(e.target.value)} required />
      <input type="url" placeholder="Live URL" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
      <input type="url" placeholder="Repo URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
      <button type="submit" className="aurora-button">{project ? 'Update' : 'Create'} Project</button>
    </form>
  );
};

export default ProjectForm;
