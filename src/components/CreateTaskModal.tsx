import { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Modal, TextInput, Button, Text, Portal, Menu, Chip } from 'react-native-paper';
import { useCreateTask } from '@/hooks/useTasks';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useUIStore } from '@/store/uiStore';
import { TaskStatus } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/utils/dateUtils';

interface CreateTaskModalProps {
  projectId: string;
  defaultStatus?: TaskStatus;
}

export function CreateTaskModal({ projectId, defaultStatus = 'todo' }: CreateTaskModalProps) {
  const { isCreateTaskModalOpen, closeCreateTaskModal } = useUIStore();
  const createTask = useCreateTask();
  const { data: members } = useProjectMembers(projectId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [assigneeMenuVisible, setAssigneeMenuVisible] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!projectId) {
      setError('Project ID is missing');
      return;
    }

    setError('');
    try {
      // Build input object, only including fields with values
      const taskInput: any = {
        projectId,
        title: title.trim(),
        status: defaultStatus,
      };

      // Only include optional fields if they have values
      if (description.trim()) {
        taskInput.description = description.trim();
      }
      if (assigneeId) {
        taskInput.assigneeId = assigneeId;
      }
      if (dueDate) {
        taskInput.dueDate = dueDate;
      }

      await createTask.mutateAsync(taskInput);
      setTitle('');
      setDescription('');
      setAssigneeId(undefined);
      setDueDate(undefined);
      closeCreateTaskModal();
    } catch (err: any) {
      // Extract error message from Firestore errors
      const errorMessage = err?.message || err?.code || 'Failed to create task';
      // Filter out index error messages and show user-friendly message
      if (errorMessage.includes('index')) {
        setError('Please wait a moment and try again');
      } else {
        setError(errorMessage);
      }
      console.error('Create task error:', err);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setAssigneeId(undefined);
    setDueDate(undefined);
    setError('');
    closeCreateTaskModal();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const selectedAssignee = members?.find((m) => m.userId === assigneeId);

  return (
    <Portal>
      <Modal
        visible={isCreateTaskModalOpen}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContent}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            Create New Task
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

          <View style={styles.fieldContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Assignee
            </Text>
            <Menu
              visible={assigneeMenuVisible}
              onDismiss={() => setAssigneeMenuVisible(false)}
              anchor={
                <Chip
                  onPress={() => setAssigneeMenuVisible(true)}
                  style={styles.chip}
                  onClose={assigneeId ? () => setAssigneeId(undefined) : undefined}
                >
                  {selectedAssignee ? selectedAssignee.userId.substring(0, 8) : 'Unassigned'}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => {
                  setAssigneeId(undefined);
                  setAssigneeMenuVisible(false);
                }}
                title="Unassigned"
              />
              {members?.map((member) => (
                <Menu.Item
                  key={member.id}
                  onPress={() => {
                    setAssigneeId(member.userId);
                    setAssigneeMenuVisible(false);
                  }}
                  title={member.userId.substring(0, 8)}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.fieldContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Due Date
            </Text>
            <View style={styles.dateContainer}>
              <Chip
                icon="calendar"
                onPress={() => setShowDatePicker(true)}
                onClose={dueDate ? () => setDueDate(undefined) : undefined}
                style={styles.chip}
              >
                {dueDate ? formatDate(dueDate) : 'No due date'}
              </Chip>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.buttons}>
            <Button mode="outlined" onPress={handleClose} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreate}
              loading={createTask.isPending}
              disabled={createTask.isPending}
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
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

