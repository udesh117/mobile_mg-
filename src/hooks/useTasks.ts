import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Task, TaskCreateInput, TaskUpdateInput, TaskStatus } from '@/types';

// Re-export useRealtimeTasks from useRealtimeTasks.ts
export { useRealtimeTasks } from './useRealtimeTasks';

const COLLECTION = 'tasks';

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      // Query without orderBy to avoid index requirement
      // We'll sort in memory instead
      const q = query(
        collection(db, COLLECTION),
        where('projectId', '==', projectId)
      );

      const snapshot = await getDocs(q);

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

      return tasks;
    },
    enabled: !!projectId,
  });
}

export function useTasksByStatus(projectId: string, status: TaskStatus) {
  return useQuery({
    queryKey: ['tasks', projectId, status],
    queryFn: async () => {
      // Query without orderBy to avoid index requirement
      // We'll sort in memory instead
      const q = query(
        collection(db, COLLECTION),
        where('projectId', '==', projectId),
        where('status', '==', status)
      );

      const snapshot = await getDocs(q);

      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || null,
      })) as Task[];

      // Sort by position
      tasks.sort((a, b) => (a.position || 0) - (b.position || 0));

      return tasks;
    },
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TaskCreateInput) => {
      // Get current max position for the status (without orderBy to avoid index)
      const statusQuery = query(
        collection(db, COLLECTION),
        where('projectId', '==', input.projectId),
        where('status', '==', input.status || 'todo')
      );

      const statusTasks = await getDocs(statusQuery);
      // Find max position in memory instead of using orderBy
      const maxPosition = statusTasks.docs.reduce((max, doc) => {
        const position = doc.data()?.position || 0;
        return Math.max(max, position);
      }, 0);

      // Build task data, excluding undefined values (Firestore doesn't accept undefined)
      const taskData: any = {
        projectId: input.projectId,
        title: input.title,
        status: input.status || 'todo',
        position: input.position ?? maxPosition + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Only include optional fields if they have values (not undefined)
      if (input.description !== undefined && input.description !== null && input.description !== '') {
        taskData.description = input.description;
      }
      if (input.assigneeId !== undefined && input.assigneeId !== null) {
        taskData.assigneeId = input.assigneeId;
      }
      if (input.priority !== undefined && input.priority !== null) {
        taskData.priority = input.priority;
      }
      if (input.dueDate !== undefined && input.dueDate !== null) {
        taskData.dueDate = input.dueDate;
      }

      const docRef = await addDoc(collection(db, COLLECTION), taskData);
      return docRef.id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectTaskCount', variables.projectId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: TaskUpdateInput }) => {
      // Filter out undefined values (Firestore doesn't accept undefined)
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Only include fields that have values
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
      if (data.position !== undefined) updateData.position = data.position;

      await updateDoc(doc(db, COLLECTION, taskId), updateData);
    },
    onSuccess: (_, variables) => {
      // Invalidate all task queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Invalidate all analytics queries since we don't have projectId here
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['projectTaskCount'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, projectId }: { taskId: string; projectId: string }) => {
      await deleteDoc(doc(db, COLLECTION, taskId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectTaskCount', variables.projectId] });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      newStatus,
      newPosition,
      projectId,
    }: {
      taskId: string;
      newStatus: TaskStatus;
      newPosition: number;
      projectId: string;
    }) => {
      const batch = writeBatch(db);
      const taskRef = doc(db, COLLECTION, taskId);

      // Update the moved task
      batch.update(taskRef, {
        status: newStatus,
        position: newPosition,
        updatedAt: serverTimestamp(),
      });

      // Update positions of other tasks in the new column if needed
      // This is a simplified version - you might want to adjust positions of all tasks
      await batch.commit();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectTaskCount', variables.projectId] });
    },
  });
}
