import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Text, Dimensions, TouchableOpacity } from 'react-native'; 
import { Task, TaskStatus } from '@/types';
import { DraggableTaskColumn } from './DraggableTaskColumn';
import { useMoveTask } from '@/hooks/useTasks';
import { scaleSize, scaleFont, scalePadding, scaleMargin } from '@/utils/responsive';
import { MaterialIcons } from '@expo/vector-icons';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskPress?: (task: Task) => void;
}

const COLUMN_CONFIG: Array<{ status: TaskStatus; title: string; badgeColor: string; bgColor: string }> = [
  { status: 'todo', title: 'To Do', badgeColor: '#9E9E9E', bgColor: '#2C2C2E' },
  { status: 'in_progress', title: 'In Progress', badgeColor: '#0A84FF', bgColor: 'rgba(10, 132, 255, 0.5)' },
  { status: 'done', title: 'Done', badgeColor: '#34C759', bgColor: 'rgba(52, 199, 89, 0.5)' },
];

export function KanbanBoard({ tasks, projectId, onTaskPress }: KanbanBoardProps) {
  const moveTask = useMoveTask();
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const columnLayouts = useRef<Map<TaskStatus, { x: number; width: number }>>(new Map());
  const [scrollX, setScrollX] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showRotateNotice, setShowRotateNotice] = useState(true);

  // Detect orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      const landscape = width > height;
      setIsLandscape(landscape);
      // Hide notice when rotated to landscape
      if (landscape) {
        setShowRotateNotice(false);
      }
    };

    // Initial check
    updateOrientation();

    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Auto-hide notice after 5 seconds
  useEffect(() => {
    if (showRotateNotice) {
      const timer = setTimeout(() => {
        setShowRotateNotice(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showRotateNotice]);

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
    <View style={styles.container}>
      {/* Rotate Notice */}
      {showRotateNotice && !isLandscape && (
        <View style={styles.rotateNotice}>
          <MaterialIcons name="screen-rotation" size={scaleSize(20)} color="#007AFF" />
          <Text style={styles.rotateNoticeText}>
            Rotate to landscape for better drag and drop
          </Text>
          <TouchableOpacity
            onPress={() => setShowRotateNotice(false)}
            activeOpacity={0.7}
            style={styles.rotateNoticeClose}
          >
            <MaterialIcons name="close" size={scaleSize(18)} color="#A0A0A0" />
          </TouchableOpacity>
        </View>
      )}

      {/* Column Headers - Minimized in landscape */}
      {!isLandscape && (
        <View style={styles.headersContainer}>
          {COLUMN_CONFIG.map((config) => {
            const taskCount = tasksByStatus[config.status].length;
            return (
              <View key={config.status} style={[styles.header, { backgroundColor: config.bgColor }]}>
                <View style={[styles.badge, { backgroundColor: config.badgeColor }]}>
                  <Text style={styles.badgeText}>{taskCount}</Text>
                </View>
                <Text style={styles.headerText}>{config.title}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Compact headers in landscape */}
      {isLandscape && (
        <View style={styles.headersContainerCompact}>
          {COLUMN_CONFIG.map((config) => {
            const taskCount = tasksByStatus[config.status].length;
            return (
              <View key={config.status} style={[styles.headerCompact, { backgroundColor: config.bgColor }]}>
                <View style={[styles.badgeCompact, { backgroundColor: config.badgeColor }]}>
                  <Text style={styles.badgeTextCompact}>{taskCount}</Text>
                </View>
                <Text style={styles.headerTextCompact}>{config.title}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Columns Grid */}
      <View style={[styles.columnsGrid, isLandscape && styles.columnsGridLandscape]}>
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
              color={config.badgeColor}
              onTaskPress={onTaskPress}
              onDragEnd={handleDragEnd}
              onTaskDragStart={handleTaskDragStart}
              onTaskDragEnd={handleTaskDragEnd}
              getColumnLayouts={getColumnLayouts}
              scrollX={scrollX}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  headersContainer: {
    flexDirection: 'row',
    gap: scaleSize(16),
    paddingHorizontal: scalePadding(16),
    paddingTop: scalePadding(16),
    paddingBottom: scalePadding(8),
  },
  headersContainerCompact: {
    flexDirection: 'row',
    gap: scaleSize(12),
    paddingHorizontal: scalePadding(12),
    paddingTop: scalePadding(8),
    paddingBottom: scalePadding(8),
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    paddingVertical: scalePadding(8),
    borderRadius: scaleSize(8),
  },
  headerCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
    paddingVertical: scalePadding(10),
    paddingHorizontal: scalePadding(8),
    borderRadius: scaleSize(8),
    minHeight: scaleSize(40),
  },
  badge: {
    width: scaleSize(20),
    height: scaleSize(20),
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCompact: {
    width: scaleSize(22),
    height: scaleSize(22),
    borderRadius: scaleSize(11),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeTextCompact: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTextCompact: {
    fontSize: scaleFont(13),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  columnsGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: scaleSize(16),
    paddingHorizontal: scalePadding(16),
    paddingTop: scalePadding(8),
    paddingBottom: scalePadding(16),
  },
  columnsGridLandscape: {
    gap: scaleSize(12),
    paddingHorizontal: scalePadding(12),
    paddingTop: scalePadding(8),
    paddingBottom: scalePadding(12),
  },
  columnWrapper: {
    flex: 1,
  },
  rotateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(12),
    paddingHorizontal: scalePadding(16),
    paddingVertical: scalePadding(12),
    marginHorizontal: scalePadding(16),
    marginTop: scalePadding(8),
    marginBottom: scalePadding(8),
    gap: scaleSize(12),
    borderWidth: 1,
    borderColor: '#404040',
  },
  rotateNoticeText: {
    flex: 1,
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  rotateNoticeClose: {
    padding: scalePadding(4),
  },
});

