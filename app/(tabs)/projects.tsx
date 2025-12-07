import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { useProjects, useRealtimeProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useUIStore } from '@/store/uiStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleSize, scaleFont, scalePadding, scaleMargin, widthPercentage } from '@/utils/responsive';
import { useState, useMemo } from 'react';

export default function ProjectsScreen() {
  const { user } = useAuthStore();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const { openCreateProjectModal } = useUIStore();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Set up real-time updates
  useRealtimeProjects();
  
  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase().trim();
    return projects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);
  
  // Calculate FAB position above bottom nav bar (responsive)
  const fabBottom = scaleSize(84) + insets.bottom + scalePadding(24);

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>
          Error loading projects
        </Text>
        <Text style={styles.errorDetail}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + scalePadding(20) }]}>
        {isSearchActive ? (
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={scaleSize(24)} color="#A0A0A0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="#737373"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearchClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={scaleSize(24)} color="#A0A0A0" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Projects</Text>
            <TouchableOpacity 
              onPress={handleSearchPress} 
              activeOpacity={0.7}
              style={styles.searchButton}
            >
              <MaterialIcons name="search" size={scaleSize(24)} color="#A0A0A0" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {projects && projects.length > 0 ? (
        <FlatList
          data={filteredProjects}
          renderItem={({ item }) => <ProjectCard project={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingTop: 8 }]}
          style={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading} 
              onRefresh={refetch}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  No projects found
                </Text>
                <Text style={styles.emptyText}>
                  Try a different search term
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No projects yet
          </Text>
          <Text style={styles.emptyText}>
            Create your first project to get started
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={openCreateProjectModal}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={scaleSize(32)} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateProjectModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scalePadding(16),
    backgroundColor: '#000000',
  },
  header: {
    justifyContent: 'center',
    paddingHorizontal: scalePadding(20),
    paddingBottom: scalePadding(20),
    paddingTop: scalePadding(20),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 2,
    borderBottomColor: '#404040',
    zIndex: 10,
    minHeight: scaleSize(80),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    fontSize: scaleFont(28),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.5,
    flex: 1,
  },
  searchButton: {
    padding: scalePadding(8),
    marginLeft: scaleMargin(16),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(12),
    paddingHorizontal: scalePadding(16),
    paddingVertical: scalePadding(12),
    gap: scaleSize(12),
    width: '100%',
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#FFFFFF',
    padding: 0,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    padding: scalePadding(16),
    paddingBottom: scaleSize(180),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: scaleMargin(16),
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
  fab: {
    position: 'absolute',
    right: scalePadding(24),
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  error: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: scaleMargin(8),
  },
  errorDetail: {
    fontSize: scaleFont(14),
    color: '#A0A0A0',
  },
});

