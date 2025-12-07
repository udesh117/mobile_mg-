import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Task } from '@/types';
import { useAuthStore } from '@/store/authStore';

export function useRealtimeTasks(projectId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    // Query without orderBy to avoid index requirement
    // We'll sort in memory instead
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isMounted) return;

        const tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          dueDate: doc.data().dueDate?.toDate() || null,
        })) as Task[];

        // Sort by status first, then by position within each status
        tasks.sort((a, b) => {
          // First sort by status (todo < in_progress < done)
          const statusOrder = { todo: 0, in_progress: 1, done: 2 };
          const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          if (statusDiff !== 0) return statusDiff;
          // Then sort by position within same status
          return (a.position || 0) - (b.position || 0);
        });

        // Debounce updates to prevent excessive re-renders
        let rafId: number | null = null;
        const updateCache = () => {
          // Update React Query cache
          queryClient.setQueryData(['tasks', projectId], tasks);

          // Also update status-specific queries (memoized for performance)
          const tasksByStatus = {
            todo: tasks.filter((t) => t.status === 'todo').sort((a, b) => (a.position || 0) - (b.position || 0)),
            in_progress: tasks
              .filter((t) => t.status === 'in_progress')
              .sort((a, b) => (a.position || 0) - (b.position || 0)),
            done: tasks.filter((t) => t.status === 'done').sort((a, b) => (a.position || 0) - (b.position || 0)),
          };

          Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
            queryClient.setQueryData(['tasks', projectId, status], statusTasks);
          });
          
          // Invalidate analytics to ensure it updates with new task data
          queryClient.invalidateQueries({ queryKey: ['analytics', projectId] });
          queryClient.invalidateQueries({ queryKey: ['projectTaskCount', projectId] });
          
          rafId = null;
        };

        // Cancel previous RAF if exists
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        
        // Use requestAnimationFrame for smooth updates
        rafId = requestAnimationFrame(updateCache);
      },
      (error) => {
        if (isMounted) {
          console.error('Realtime subscription error:', error);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [projectId, queryClient]);
}

