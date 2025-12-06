import { useQuery } from '@tanstack/react-query';
import { useTasks } from './useTasks';
import { AnalyticsData } from '@/types';

export function useProjectAnalytics(projectId: string) {
  const { data: tasks, isLoading } = useTasks(projectId);

  return useQuery({
    queryKey: ['analytics', projectId],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!tasks) {
        return {
          tasksByStatus: { todo: 0, in_progress: 0, done: 0 },
          tasksByAssignee: [],
          totalTasks: 0,
        };
      }

      const tasksByStatus = {
        todo: tasks.filter((t) => t.status === 'todo').length,
        in_progress: tasks.filter((t) => t.status === 'in_progress').length,
        done: tasks.filter((t) => t.status === 'done').length,
      };

      // Count tasks by assignee
      const assigneeMap = new Map<string, number>();
      tasks.forEach((task) => {
        if (task.assigneeId) {
          assigneeMap.set(task.assigneeId, (assigneeMap.get(task.assigneeId) || 0) + 1);
        }
      });

      const tasksByAssignee = Array.from(assigneeMap.entries()).map(([assigneeId, count]) => ({
        assigneeId,
        count,
      }));

      return {
        tasksByStatus,
        tasksByAssignee,
        totalTasks: tasks.length,
      };
    },
    enabled: !!tasks && !isLoading,
    staleTime: 1000 * 30, // 30 seconds
  });
}

