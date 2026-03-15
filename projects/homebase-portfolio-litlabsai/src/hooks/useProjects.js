import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const q = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ ...doc.data(), id: doc.id });
      });
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addProject = async (project) => {
    if (!user) return;
    await addDoc(collection(db, "projects"), {
      ...project,
      userId: user.uid,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });
  };

  const deleteProject = async (id) => {
    await deleteDoc(doc(db, "projects", id));
  };

  return { projects, loading, addProject, deleteProject };
};

export default useProjects;
