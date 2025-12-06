import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { CrossColumnDraggableTask } from './CrossColumnDraggableTask';

interface DraggableTaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onDragEnd: (data: Task[], status: TaskStatus) => void;
  onTaskDragStart?: (task: Task) => void;
  onTaskDragEnd?: (task: Task, targetStatus?: TaskStatus) => void;
  getColumnLayouts?: () => Map<TaskStatus, { x: number; width: number }>;
  scrollX?: number;
  title: string;
  color: string;
}

export function DraggableTaskColumn({
  status,
  tasks,
  title,
  color,
  onTaskPress,
  onDragEnd,
  onTaskDragStart,
  onTaskDragEnd,
  getColumnLayouts,
  scrollX = 0,
}: DraggableTaskColumnProps) {
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <ScaleDecorator>
        <View
          style={[styles.dragItem, isActive && styles.dragItemActive]}
        >
          {/* Use CrossColumnDraggableTask for cross-column drag support */}
          {/* The drag from DraggableFlatList handles within-column reordering */}
          <CrossColumnDraggableTask
            task={item}
            currentStatus={status}
            onPress={() => onTaskPress?.(item)}
            onDragStart={(task) => {
              onTaskDragStart?.(task);
              // Also trigger the within-column drag for visual feedback
              drag();
            }}
            onDragEnd={(task, targetStatus) => {
              // If dropped on different column, use cross-column handler
              if (targetStatus && targetStatus !== status) {
                onTaskDragEnd?.(task, targetStatus);
              }
              // Otherwise, let the within-column drag handle reordering
            }}
            getColumnLayouts={getColumnLayouts}
            scrollX={scrollX}
          />
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: color }]}>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodySmall" style={styles.count}>
          {tasks.length}
        </Text>
      </Surface>

      <View style={styles.tasksContainer}>
        {tasks.length > 0 ? (
          <DraggableFlatList
            data={tasks}
            onDragEnd={({ data }) => onDragEnd(data, status)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text variant="bodySmall" style={styles.emptyText}>
              No tasks
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 300,
  },
  header: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    color: 'white',
  },
  count: {
    color: 'white',
    opacity: 0.9,
  },
  tasksContainer: {
    flex: 1,
  },
  dragItem: {
    marginBottom: 8,
  },
  dragItemActive: {
    opacity: 0.5,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
  },
});

