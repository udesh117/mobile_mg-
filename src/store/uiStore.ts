import { create } from 'zustand';

interface UIState {
  isCreateProjectModalOpen: boolean;
  isCreateTaskModalOpen: boolean;
  isEditTaskModalOpen: boolean;
  selectedTaskId: string | null;
  openCreateProjectModal: () => void;
  closeCreateProjectModal: () => void;
  openCreateTaskModal: () => void;
  closeCreateTaskModal: () => void;
  openEditTaskModal: (taskId: string) => void;
  closeEditTaskModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateProjectModalOpen: false,
  isCreateTaskModalOpen: false,
  isEditTaskModalOpen: false,
  selectedTaskId: null,
  openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
  closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),
  openCreateTaskModal: () => set({ isCreateTaskModalOpen: true }),
  closeCreateTaskModal: () => set({ isCreateTaskModalOpen: false }),
  openEditTaskModal: (taskId: string) => set({ isEditTaskModalOpen: true, selectedTaskId: taskId }),
  closeEditTaskModal: () => set({ isEditTaskModalOpen: false, selectedTaskId: null }),
}));

