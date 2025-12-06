import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import { useProjects } from '@/hooks/useProjects';
import { useProjectAnalytics } from '@/hooks/useAnalytics';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function AnalyticsScreen() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { data: analytics, isLoading: analyticsLoading } = useProjectAnalytics(selectedProjectId);

  if (projectsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleLarge">No projects yet</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Create a project to see analytics
        </Text>
      </View>
    );
  }

  // Set default project if none selected
  if (!selectedProjectId && projects.length > 0) {
    setSelectedProjectId(projects[0].id);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Project Analytics
      </Text>

      <View style={styles.pickerContainer}>
        <Text variant="bodyMedium" style={styles.label}>
          Select Project:
        </Text>
        <Surface style={styles.pickerSurface}>
          <Picker
            selectedValue={selectedProjectId}
            onValueChange={setSelectedProjectId}
            style={styles.picker}
          >
            {projects.map((project) => (
              <Picker.Item key={project.id} label={project.name} value={project.id} />
            ))}
          </Picker>
        </Surface>
      </View>

      {analyticsLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : analytics ? (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Tasks by Status
              </Text>
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: '#9e9e9e' }]}>
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {analytics.tasksByStatus.todo}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    To Do
                  </Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#2196f3' }]}>
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {analytics.tasksByStatus.in_progress}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    In Progress
                  </Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#4caf50' }]}>
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {analytics.tasksByStatus.done}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Done
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Tasks by Assignee
              </Text>
              {analytics.tasksByAssignee.length > 0 ? (
                analytics.tasksByAssignee.map((item) => (
                  <View key={item.assigneeId} style={styles.assigneeRow}>
                    <Text variant="bodyLarge" style={styles.assigneeName}>
                      {item.assigneeId.substring(0, 8)}...
                    </Text>
                    <Text variant="bodyLarge" style={styles.assigneeCount}>
                      {item.count} task{item.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No assigned tasks
                </Text>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Summary
              </Text>
              <Text variant="headlineMedium" style={styles.totalTasks}>
                Total Tasks: {analytics.totalTasks}
              </Text>
            </Card.Content>
          </Card>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  pickerContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  pickerSurface: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'white',
  },
  assigneeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  assigneeName: {
    flex: 1,
  },
  assigneeCount: {
    fontWeight: '600',
  },
  totalTasks: {
    marginTop: 8,
  },
  loader: {
    marginVertical: 32,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
});

