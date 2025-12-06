import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { Project } from '@/types';
import { router } from 'expo-router';
import { formatDate } from '@/utils/dateUtils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const handlePress = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Avatar.Text size={40} label={project.name.charAt(0).toUpperCase()} />
            <View style={styles.content}>
              <Text variant="titleMedium" style={styles.title}>
                {project.name}
              </Text>
              {project.description ? (
                <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
                  {project.description}
                </Text>
              ) : null}
              <Text variant="bodySmall" style={styles.date}>
                Created {formatDate(project.createdAt)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    marginBottom: 4,
    fontWeight: '600',
  },
  description: {
    color: '#666',
    marginBottom: 4,
  },
  date: {
    color: '#999',
    marginTop: 4,
  },
});

