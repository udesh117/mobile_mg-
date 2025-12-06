import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator, Surface } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { useProjects, useRealtimeProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useUIStore } from '@/store/uiStore';

export default function ProjectsScreen() {
  const { user } = useAuthStore();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const { openCreateProjectModal } = useUIStore();
  
  // Set up real-time updates
  useRealtimeProjects();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.error}>
          Error loading projects
        </Text>
        <Text variant="bodySmall" style={styles.errorDetail}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          My Projects
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {projects && projects.length > 0 ? (
        <FlatList
          data={projects}
          renderItem={({ item }) => <ProjectCard project={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      ) : (
        <Surface style={styles.emptyContainer}>
          <Text variant="titleLarge" style={styles.emptyTitle}>
            No projects yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Create your first project to get started
          </Text>
        </Surface>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreateProjectModal}
        label="New Project"
      />

      <CreateProjectModal />
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
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    padding: 32,
    borderRadius: 12,
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
  error: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorDetail: {
    color: '#666',
  },
});

