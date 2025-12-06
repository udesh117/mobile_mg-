import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, TextInput, Button, Text, Portal, Menu, Chip } from 'react-native-paper';
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useUIStore } from '@/store/uiStore';
import { TaskStatus } from '@/types';

export function EditTaskModal() {
  const { isEditTaskModalOpen, selectedTaskId, closeEditTaskModal } = useUIStore();
  
  // We need to get the task from a query - but we don't have projectId yet
  // For now, we'll fetch all tasks from a parent component or use a different approach
  // This is a simplified version - in production you'd want to pass projectId as prop
  const [task, setTask] = useState<any>(null);
  const [projectId, setProjectId] = useState<string>('');
  
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setProjectId(task.projectId);
    }
  }, [task]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!selectedTaskId || !projectId) return;

    setError('');
    try {
      await updateTask.mutateAsync({
        taskId: selectedTaskId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
        },
      });
      closeEditTaskModal();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!selectedTaskId || !projectId) return;

    try {
      await deleteTask.mutateAsync({
        taskId: selectedTaskId,
        projectId,
      });
      closeEditTaskModal();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setError('');
    closeEditTaskModal();
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  if (!task) return null;

  return (
    <Portal>
      <Modal
        visible={isEditTaskModalOpen}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContent}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            Edit Task
          </Text>

          {error ? (
            <Text style={styles.error} variant="bodyMedium">
              {error}
            </Text>
          ) : null}

          <TextInput
            label="Task Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
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

          <View style={styles.statusContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Status
            </Text>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Chip
                  onPress={() => setStatusMenuVisible(true)}
                  style={styles.chip}
                >
                  {statusLabels[status]}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => {
                  setStatus('todo');
                  setStatusMenuVisible(false);
                }}
                title="To Do"
              />
              <Menu.Item
                onPress={() => {
                  setStatus('in_progress');
                  setStatusMenuVisible(false);
                }}
                title="In Progress"
              />
              <Menu.Item
                onPress={() => {
                  setStatus('done');
                  setStatusMenuVisible(false);
                }}
                title="Done"
              />
            </Menu>
          </View>

          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={handleDelete}
              loading={deleteTask.isPending}
              disabled={deleteTask.isPending}
              buttonColor="#d32f2f"
              textColor="#d32f2f"
              style={styles.button}
            >
              Delete
            </Button>
            <View style={styles.rightButtons}>
              <Button mode="outlined" onPress={handleClose} style={styles.button}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdate}
                loading={updateTask.isPending}
                disabled={updateTask.isPending}
                style={styles.button}
              >
                Save
              </Button>
            </View>
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
  statusContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  rightButtons: {
    flexDirection: 'row',
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

