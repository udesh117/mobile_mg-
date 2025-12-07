import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useProject } from '@/hooks/useProjects';
import { useTasks, useRealtimeTasks } from '@/hooks/useTasks';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModalWithData } from '@/components/EditTaskModalWithData';
import { useUIStore } from '@/store/uiStore';
import { Task } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleSize, scaleFont, scalePadding, scaleMargin } from '@/utils/responsive';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasks, isLoading: tasksLoading } = useTasks(id);
  const { openCreateTaskModal, isEditTaskModalOpen } = useUIStore();
  const insets = useSafeAreaInsets();
  const [isLandscape, setIsLandscape] = useState(false);
  
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Detect orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setIsLandscape(width > height);
    };

    updateOrientation();
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Set up real-time updates
  useRealtimeTasks(id);

  // Enable rotation for this screen only
  useFocusEffect(
    useCallback(() => {
      // Unlock orientation when screen is focused
      ScreenOrientation.unlockAsync();
      
      return () => {
        // Lock back to portrait when screen is unfocused
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

  const isLoading = projectLoading || tasksLoading;

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    useUIStore.getState().openEditTaskModal(task.id);
  };

  // Conditional returns AFTER all hooks
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isLandscape && (
        <View style={[styles.header, { paddingTop: insets.top + scalePadding(16) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={scaleSize(20)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{project.name}</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      {isLandscape && (
        <View style={[styles.headerCompact, { paddingTop: insets.top + scalePadding(8) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonCompact}>
            <MaterialIcons name="arrow-back-ios" size={scaleSize(18)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleCompact}>{project.name}</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <View style={styles.boardContainer}>
        {tasks && tasks.length > 0 ? (
          <KanbanBoard tasks={tasks} projectId={id} onTaskPress={handleTaskPress} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              No tasks yet
            </Text>
            <Text style={styles.emptyText}>
              Create your first task to get started
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, isLandscape && styles.fabLandscape]}
        onPress={openCreateTaskModal}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={scaleSize(32)} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateTaskModal projectId={id} />
      {selectedTask && isEditTaskModalOpen && (
        <EditTaskModalWithData task={selectedTask} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scalePadding(16),
    paddingBottom: scalePadding(16),
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scalePadding(12),
    paddingBottom: scalePadding(8),
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  backButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonCompact: {
    width: scaleSize(36),
    height: scaleSize(36),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.015,
  },
  headerTitleCompact: {
    flex: 1,
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.015,
  },
  headerSpacer: {
    width: scaleSize(40),
  },
  boardContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scalePadding(32),
  },
  emptyTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: scaleMargin(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: scaleFont(16),
    color: '#A0A0A0',
    textAlign: 'center',
  },
  errorText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#EF4444',
  },
  fab: {
    position: 'absolute',
    bottom: scalePadding(24),
    right: scalePadding(24),
    width: scaleSize(64),
    height: scaleSize(64),
    borderRadius: scaleSize(32),
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.5,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  fabLandscape: {
    bottom: scalePadding(16),
    right: scalePadding(16),
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
  },
});

