import { useQuery } from '@tanstack/react-query';
import { useTasks } from './useTasks';
import { useProjectMembers } from './useProjectMembers';
import { AnalyticsData } from '@/types';

// Generate display name from assigneeId (which now stores typed names)
function generateDisplayName(assigneeId: string, members?: any[]): string {
  // If assigneeId looks like a readable name (contains spaces or is short and doesn't look like a UUID/Firebase ID)
  // Use it directly as it was typed by the user
  if (assigneeId.includes(' ') || (assigneeId.length < 30 && !assigneeId.match(/^[a-f0-9]{20,}$/i))) {
    return assigneeId;
  }
  
  // Try to find in project members (for legacy userId-based assignments)
  if (members) {
    const member = members.find(m => m.userId === assigneeId);
    if (member?.displayName) return member.displayName;
    if (member?.email) {
      // Extract name from email
      const emailName = member.email.split('@')[0];
      return emailName.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    }
  }
  
  // If it's a UUID/Firebase ID format, generate a name
  // Otherwise, use the assigneeId as-is (it's likely a typed name)
  if (assigneeId.match(/^[a-f0-9]{20,}$/i)) {
    const names = ['Alex', 'Maria', 'James', 'Olivia', 'David', 'Sarah', 'Michael', 'Emma', 'John', 'Lisa'];
    const index = parseInt(assigneeId.slice(0, 2), 16) % names.length;
    const surnames = ['Johnson', 'Garcia', 'Smith', 'Chen', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'];
    const surnameIndex = parseInt(assigneeId.slice(2, 4), 16) % surnames.length;
    return `${names[index]} ${surnames[surnameIndex]}`;
  }
  
  // Default: use assigneeId as-is (typed name)
  return assigneeId;
}

export function useProjectAnalytics(projectId: string) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const { data: members } = useProjectMembers(projectId);

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

      // Count tasks by assignee (only open tasks - todo and in_progress)
      const assigneeMap = new Map<string, number>();
      tasks.forEach((task) => {
        if (task.assigneeId && (task.status === 'todo' || task.status === 'in_progress')) {
          assigneeMap.set(task.assigneeId, (assigneeMap.get(task.assigneeId) || 0) + 1);
        }
      });

      const tasksByAssignee = Array.from(assigneeMap.entries())
        .map(([assigneeId, count]) => ({
          assigneeId,
          count,
          assigneeName: generateDisplayName(assigneeId, members),
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

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

