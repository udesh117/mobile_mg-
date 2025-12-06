export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date | string | null;
  status: TaskStatus;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TaskCreateInput {
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date | string | null;
  status?: TaskStatus;
  position?: number;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date | string | null;
  status?: TaskStatus;
  position?: number;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: Date | string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  ownerId: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  email?: string; // User email for display
  displayName?: string; // User display name (optional)
  role: 'owner' | 'member';
  createdAt?: Date | string;
}

export interface ProjectMemberCreateInput {
  projectId: string;
  userId: string;
  email?: string;
  displayName?: string;
  role?: 'owner' | 'member';
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface AnalyticsData {
  tasksByStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  tasksByAssignee: Array<{
    assigneeId: string;
    count: number;
    assigneeName?: string;
  }>;
  totalTasks: number;
}

