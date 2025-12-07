import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Task } from '@/types';
import { isToday, isTomorrow, differenceInDays, isPast } from 'date-fns';
import { isOverdue } from '@/utils/dateUtils';
import { scaleSize, scaleFont, scalePadding, scaleMargin } from '@/utils/responsive';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void;
}

type Priority = 'high' | 'medium' | 'low';

function getPriority(task: Task): Priority {
  if (!task.dueDate) return 'low';
  
  const dateObj = typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate;
  
  if (isOverdue(dateObj) || isToday(dateObj) || isTomorrow(dateObj)) {
    return 'high';
  }
  
  const daysUntil = differenceInDays(dateObj, new Date());
  if (daysUntil <= 3) {
    return 'medium';
  }
  
  return 'low';
}

function getDueDateText(task: Task): string {
  if (!task.dueDate) return '';
  
  const dateObj = typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate;
  
  if (isToday(dateObj)) {
    return 'Due: Today';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Due: Tomorrow';
  }
  
  const daysUntil = differenceInDays(dateObj, new Date());
  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return `Due: ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  }
  
  return `Due: In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
}

export function TaskCard({ task, onPress, onLongPress }: TaskCardProps) {
  const priority = getPriority(task);
  const dueDateText = getDueDateText(task);

  const priorityConfig = {
    high: { bg: 'rgba(239, 68, 68, 0.5)', dot: '#EF4444', text: '#FCA5A5' },
    medium: { bg: 'rgba(249, 115, 22, 0.5)', dot: '#F97316', text: '#FDBA74' },
    low: { bg: 'rgba(234, 179, 8, 0.5)', dot: '#EAB308', text: '#FDE047' },
  };

  const config = priorityConfig[priority];

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.title}>{task.title}</Text>
          
          <View style={styles.footer}>
            {dueDateText ? (
              <Text style={styles.dueDate}>{dueDateText}</Text>
            ) : null}
            
            <View style={[styles.priorityBadge, { backgroundColor: config.bg }]}>
              <View style={[styles.priorityDot, { backgroundColor: config.dot }]} />
              <Text style={[styles.priorityText, { color: config.text }]}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: scaleSize(12),
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  content: {
    padding: scalePadding(12),
    gap: scaleSize(8),
  },
  title: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.015,
    lineHeight: scaleSize(20),
  },
  footer: {
    marginTop: scaleMargin(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: scaleSize(12),
  },
  dueDate: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#A0A0A0',
    lineHeight: scaleSize(20),
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    paddingHorizontal: scalePadding(8),
    paddingVertical: scalePadding(4),
    borderRadius: scaleSize(9999),
  },
  priorityDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  priorityText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
  },
});

