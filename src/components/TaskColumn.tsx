import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  title: string;
  color: string;
}

export function TaskColumn({ status, tasks, title, color, onTaskPress }: TaskColumnProps) {
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
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => onTaskPress?.(task)}
            />
          ))
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
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
  },
});

