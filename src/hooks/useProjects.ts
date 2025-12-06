import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Project, ProjectCreateInput, ProjectUpdateInput } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

const COLLECTION = 'projects';

export function useProjects() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['projects', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Query without orderBy to avoid index requirement
      // We'll sort in memory instead
      const q = query(
        collection(db, COLLECTION),
        where('ownerId', '==', user.uid)
      );

      const snapshot = await getDocs(q);

      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Project[];

      // Sort by createdAt descending in memory
      projects.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });

      return projects;
    },
    enabled: !!user,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const docRef = doc(db, COLLECTION, projectId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Project not found');
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data()?.createdAt?.toDate() || new Date(),
      } as Project;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: Omit<ProjectCreateInput, 'ownerId'>) => {
      if (!user) throw new Error('User not authenticated');

      const projectData = {
        name: input.name,
        description: input.description,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION), projectData);
      
      // Add owner as project member
      const memberId = `${docRef.id}_${user.uid}`;
      await setDoc(doc(db, 'projectMembers', memberId), {
        projectId: docRef.id,
        userId: user.uid,
        role: 'owner',
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: ProjectUpdateInput }) => {
      await updateDoc(doc(db, COLLECTION, projectId), data as any);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Firestore will cascade delete tasks and members if rules are set up correctly
      await deleteDoc(doc(db, COLLECTION, projectId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRealtimeProjects() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.uid) return;

    // Query without orderBy to avoid index requirement
    // We'll sort in memory instead
    const q = query(
      collection(db, COLLECTION),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Project[];
        
        // Sort by createdAt descending in memory
        projects.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return bTime - aTime;
        });

        queryClient.setQueryData(['projects', user.uid], projects);
      },
      (error) => {
        console.error('Realtime projects subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, queryClient]);
}
