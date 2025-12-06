import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Avatar } from 'react-native-paper';
import { Task } from '@/types';
import { formatDate, isOverdue, getDueDateLabel } from '@/utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TaskCard({ task, onPress, onLongPress }: TaskCardProps) {
  const isOverdueTask = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <Card style={[styles.card, isOverdueTask && styles.overdueCard]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            {task.title}
          </Text>
          
          {task.description ? (
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            {task.assigneeId ? (
              <View style={styles.assignee}>
                <Avatar.Text size={24} label={task.assigneeId.charAt(0).toUpperCase()} />
                <Text variant="bodySmall" style={styles.assigneeText}>
                  Assigned
                </Text>
              </View>
            ) : null}

            {task.dueDate ? (
              <Chip
                icon="calendar"
                style={[styles.chip, isOverdueTask && styles.overdueChip]}
                textStyle={isOverdueTask ? styles.overdueText : undefined}
              >
                {getDueDateLabel(task.dueDate)}
              </Chip>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    elevation: 2,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assigneeText: {
    color: '#666',
  },
  chip: {
    height: 28,
  },
  overdueChip: {
    backgroundColor: '#ffebee',
  },
  overdueText: {
    color: '#d32f2f',
  },
});

