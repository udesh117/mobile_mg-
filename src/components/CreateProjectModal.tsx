import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Modal, Text, Portal } from 'react-native-paper';
import { useCreateProject } from '@/hooks/useProjects';
import { useUIStore } from '@/store/uiStore';
import { scaleSize, scaleFont, scalePadding, scaleMargin, widthPercentage } from '@/utils/responsive';

export function CreateProjectModal() {
  const { isCreateProjectModalOpen, closeCreateProjectModal } = useUIStore();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

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
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <Text style={styles.title}>Create New Project</Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper,
                    nameFocused && styles.inputWrapperFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Project Name *"
                      placeholderTextColor="#737373"
                      value={name}
                      onChangeText={setName}
                      autoFocus
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper,
                    styles.textAreaWrapper,
                    descriptionFocused && styles.inputWrapperFocused
                  ]}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Description"
                      placeholderTextColor="#737373"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      onFocus={() => setDescriptionFocused(true)}
                      onBlur={() => setDescriptionFocused(false)}
                    />
                  </View>
                </View>

                {error ? (
                  <Text style={styles.error}>{error}</Text>
                ) : null}
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.createButton, createProject.isPending && styles.buttonDisabled]}
                  onPress={handleCreate}
                  disabled={createProject.isPending}
                  activeOpacity={0.9}
                >
                  {createProject.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.createButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardView: {
    width: '100%',
    maxWidth: widthPercentage(90),
    margin: scaleMargin(20),
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: scalePadding(24),
    paddingTop: scalePadding(24),
    paddingBottom: scalePadding(24),
    borderRadius: scaleSize(12),
    width: '100%',
    overflow: 'hidden',
  },
  title: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: '#E3E3E3',
    marginBottom: scaleMargin(24),
    textAlign: 'left',
  },
  form: {
    marginBottom: scaleMargin(32),
    gap: scaleSize(20),
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: '#171717',
    minHeight: scaleSize(56),
    paddingHorizontal: scalePadding(16),
    paddingVertical: 0,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: scalePadding(8),
  },
  inputWrapperFocused: {
    borderColor: '#0A84FF',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: scaleSize(56),
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#FFFFFF',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textArea: {
    height: scaleSize(100),
    paddingTop: scalePadding(8),
    paddingBottom: scalePadding(8),
    minHeight: scaleSize(100),
  },
  error: {
    color: '#EF4444',
    fontSize: scaleFont(14),
    textAlign: 'left',
    marginTop: scaleMargin(4),
    marginBottom: scaleMargin(8),
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: scaleSize(12),
    marginTop: 0,
    width: '100%',
    flexShrink: 1,
  },
  cancelButton: {
    paddingHorizontal: scalePadding(24),
    paddingVertical: scalePadding(12),
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: 'transparent',
    minHeight: scaleSize(44),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
  },
  cancelButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: scaleSize(20),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  createButton: {
    paddingHorizontal: scalePadding(24),
    paddingVertical: scalePadding(12),
    borderRadius: scaleSize(12),
    backgroundColor: '#0A84FF',
    minHeight: scaleSize(44),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  createButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: scaleSize(20),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

