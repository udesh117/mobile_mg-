import { useMemo, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, LayoutChangeEvent } from 'react-native';
import { Task, TaskStatus } from '@/types';
import { DraggableTaskColumn } from './DraggableTaskColumn';
import { useMoveTask } from '@/hooks/useTasks';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskPress?: (task: Task) => void;
}

const COLUMN_CONFIG: Array<{ status: TaskStatus; title: string; color: string }> = [
  { status: 'todo', title: 'To Do', color: '#9e9e9e' },
  { status: 'in_progress', title: 'In Progress', color: '#2196f3' },
  { status: 'done', title: 'Done', color: '#4caf50' },
];

export function KanbanBoard({ tasks, projectId, onTaskPress }: KanbanBoardProps) {
  const moveTask = useMoveTask();
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const columnLayouts = useRef<Map<TaskStatus, { x: number; width: number }>>(new Map());
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);

  // Memoize tasksByStatus to prevent unnecessary recalculations
  const tasksByStatus = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { todo: [], in_progress: [], done: [] };
    }
    return {
      todo: tasks.filter((t) => t?.status === 'todo').sort((a, b) => (a.position || 0) - (b.position || 0)),
      in_progress: tasks
        .filter((t) => t?.status === 'in_progress')
        .sort((a, b) => (a.position || 0) - (b.position || 0)),
      done: tasks.filter((t) => t?.status === 'done').sort((a, b) => (a.position || 0) - (b.position || 0)),
    };
  }, [tasks]);

  const handleColumnLayout = useCallback((status: TaskStatus, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    columnLayouts.current.set(status, { x, width });
    console.log(`Column ${status} layout: x=${x}, width=${width}`);
  }, []);

  const handleScroll = useCallback((event: any) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  }, []);

  // Function to get column layout info for drag detection
  const getColumnLayouts = useCallback(() => {
    return columnLayouts.current;
  }, []);

  const handleTaskDragStart = (task: Task) => {
    setDraggingTask(task);
  };

  const handleTaskDragEnd = async (task: Task, targetStatus?: TaskStatus) => {
    setDraggingTask(null);
    
    if (!targetStatus || targetStatus === task.status) {
      return; // No change needed
    }

    try {
      // Get max position in target column
      const targetTasks = tasksByStatus[targetStatus] || [];
      const maxPosition = targetTasks.length > 0
        ? Math.max(...targetTasks.map(t => t.position || 0))
        : -1;

      await moveTask.mutateAsync({
        taskId: task.id,
        newStatus: targetStatus,
        newPosition: maxPosition + 1,
        projectId,
      });
    } catch (error) {
      console.error('Error moving task between columns:', error);
    }
  };

  const handleDragEnd = async (newTasks: Task[], status: TaskStatus) => {
    if (!newTasks || newTasks.length === 0) return;
    
    try {
      // Update positions for all tasks in the column
      const updates = newTasks
        .filter((task) => task && task.id) // Filter out invalid tasks
        .map((task, index) => {
          const needsUpdate = task.status !== status || (task.position || 0) !== index;
          
          if (needsUpdate) {
            return moveTask.mutateAsync({
              taskId: task.id,
              newStatus: status,
              newPosition: index,
              projectId,
            });
          }
          return Promise.resolve();
        });

      await Promise.all(updates);
    } catch (error) {
      console.error('Error updating task positions:', error);
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {COLUMN_CONFIG.map((config) => (
        <View
          key={config.status}
          onLayout={(e) => handleColumnLayout(config.status, e)}
          style={styles.columnWrapper}
        >
          <DraggableTaskColumn
            status={config.status}
            tasks={tasksByStatus[config.status]}
            title={config.title}
            color={config.color}
            onTaskPress={onTaskPress}
            onDragEnd={handleDragEnd}
            onTaskDragStart={handleTaskDragStart}
            onTaskDragEnd={handleTaskDragEnd}
            getColumnLayouts={getColumnLayouts}
            scrollX={scrollX}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    minWidth: '100%',
  },
  columnWrapper: {
    minWidth: 300,
  },
});

