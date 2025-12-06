import { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Appbar, FAB } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useProject } from '@/hooks/useProjects';
import { useTasks, useRealtimeTasks } from '@/hooks/useTasks';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModalWithData } from '@/components/EditTaskModalWithData';
import { useUIStore } from '@/store/uiStore';
import { Task } from '@/types';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasks, isLoading: tasksLoading } = useTasks(id);
  const { openCreateTaskModal, isEditTaskModalOpen } = useUIStore();
  
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Set up real-time updates
  useRealtimeTasks(id);

  const isLoading = projectLoading || tasksLoading;

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    useUIStore.getState().openEditTaskModal(task.id);
  };

  // Conditional returns AFTER all hooks
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">Project not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={project.name} />
      </Appbar.Header>

      <View style={styles.boardContainer}>
        {tasks && tasks.length > 0 ? (
          <KanbanBoard tasks={tasks} projectId={id} onTaskPress={handleTaskPress} />
        ) : (
          <View style={styles.emptyState}>
            <Text variant="titleLarge" style={styles.emptyTitle}>
              No tasks yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Create your first task to get started
            </Text>
          </View>
        )}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreateTaskModal}
        label="New Task"
      />

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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

