import { View, StyleSheet, Text } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { CrossColumnDraggableTask } from './CrossColumnDraggableTask';
import { MaterialIcons } from '@expo/vector-icons';
import { scaleSize, scaleFont, scalePadding, scaleMargin } from '@/utils/responsive';

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
  const renderItem = ({ item, drag, isActive, index }: RenderItemParams<Task>) => {
    const handleCrossColumnDragEnd = (task: Task, targetStatus?: TaskStatus) => {
      // If dropped on different column, use cross-column handler
      if (targetStatus && targetStatus !== status) {
        onTaskDragEnd?.(task, targetStatus);
      }
      // Otherwise, let the within-column drag handle reordering
    };

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
              // Don't call drag() here - let CrossColumnDraggableTask handle it
              // Only call drag() if it's a within-column reorder
            }}
            onDragEnd={handleCrossColumnDragEnd}
            getColumnLayouts={getColumnLayouts}
            scrollX={scrollX}
            onWithinColumnDrag={drag}
          />
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tasksContainer}>
        {tasks.length > 0 ? (
          <DraggableFlatList
            data={tasks}
            onDragEnd={({ data }) => onDragEnd(data, status)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={true}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="drag-indicator" size={scaleSize(48)} color="#737373" />
            <Text style={styles.emptyText}>
              Drag tasks here
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
  },
  tasksContainer: {
    flex: 1,
  },
  listContent: {
    gap: scaleSize(16),
    paddingBottom: scaleSize(80),
  },
  dragItem: {
    marginBottom: 0,
  },
  dragItemActive: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(12),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#404040',
    minHeight: scaleSize(200),
    padding: scalePadding(24),
    marginHorizontal: scaleMargin(4),
  },
  emptyText: {
    fontSize: scaleFont(14),
    color: '#737373',
    textAlign: 'center',
    marginTop: scaleMargin(8),
  },
});

