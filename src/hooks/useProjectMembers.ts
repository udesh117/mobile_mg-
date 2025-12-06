import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ProjectMember, ProjectMemberCreateInput } from '@/types';

const COLLECTION = 'projectMembers';

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: async () => {
      const q = query(
        collection(db, COLLECTION),
        where('projectId', '==', projectId)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ProjectMember[];
    },
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProjectMemberCreateInput) => {
      const memberId = `${input.projectId}_${input.userId}`;
      await setDoc(doc(db, COLLECTION, memberId), {
        ...input,
        role: input.role || 'member',
        createdAt: serverTimestamp(),
      });
      return memberId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', variables.projectId] });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      const memberId = `${projectId}_${userId}`;
      await deleteDoc(doc(db, COLLECTION, memberId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', variables.projectId] });
    },
  });
}
