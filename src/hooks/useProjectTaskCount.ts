import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export function useProjectTaskCount(projectId: string) {
  return useQuery({
    queryKey: ['projectTaskCount', projectId],
    queryFn: async () => {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );

      const snapshot = await getDocs(q);
      const totalTasks = snapshot.size;
      const doneTasks = snapshot.docs.filter(
        doc => doc.data().status === 'done'
      ).length;

      return {
        total: totalTasks,
        done: doneTasks,
      };
    },
    enabled: !!projectId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

