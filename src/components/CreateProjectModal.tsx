import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, TextInput, Button, Text, Portal } from 'react-native-paper';
import { useCreateProject } from '@/hooks/useProjects';
import { useUIStore } from '@/store/uiStore';

export function CreateProjectModal() {
  const { isCreateProjectModalOpen, closeCreateProjectModal } = useUIStore();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setError('');
    try {
      await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      closeCreateProjectModal();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    closeCreateProjectModal();
  };

  return (
    <Portal>
      <Modal
        visible={isCreateProjectModalOpen}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContent}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            Create New Project
          </Text>

          {error ? (
            <Text style={styles.error} variant="bodyMedium">
              {error}
            </Text>
          ) : null}

          <TextInput
            label="Project Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            autoFocus
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <View style={styles.buttons}>
            <Button mode="outlined" onPress={handleClose} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreate}
              loading={createProject.isPending}
              disabled={createProject.isPending}
              style={styles.button}
            >
              Create
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
  },
});

