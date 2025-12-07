import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleSize, scaleFont, scalePadding, scaleMargin } from '@/utils/responsive';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_IMAGE_KEY = '@profile_image';

// Generate display name from email
function getDisplayName(email: string | null | undefined): string {
  if (!email) return 'User';
  const namePart = email.split('@')[0];
  // Convert "alex.morgan" to "Alex Morgan"
  return namePart
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Load profile image on mount
  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const imageUri = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (imageUri) {
        setProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const saveProfileImage = async (uri: string) => {
    try {
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, uri);
      setProfileImage(uri);
    } catch (error) {
      console.error('Error saving profile image:', error);
      Alert.alert('Error', 'Failed to save profile picture');
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and media library permissions to upload profile pictures.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setUploading(true);
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        await saveProfileImage(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfile = async () => {
    Alert.alert(
      'Remove Profile Picture',
      `Are you sure you want to remove the profile picture for ${displayName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
              setProfileImage(null);
            } catch (error) {
              console.error('Error removing profile image:', error);
              Alert.alert('Error', 'Failed to remove profile picture');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const showImagePickerOptions = () => {
    const options: Array<{
      text: string;
      onPress?: () => void | Promise<void>;
      style?: 'default' | 'cancel' | 'destructive';
    }> = [
      {
        text: 'Camera',
        onPress: () => handleImagePicker('camera'),
      },
      {
        text: 'Gallery',
        onPress: () => handleImagePicker('gallery'),
      },
    ];

    // Only show remove option if there's a profile image
    if (profileImage) {
      options.push({
        text: 'Remove Profile Picture',
        style: 'destructive',
        onPress: handleRemoveProfile,
      });
    }

    options.push({
      text: 'Cancel',
      style: 'cancel',
    });

    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      options,
      { cancelable: true }
    );
  };

  const handleAccountPress = () => {
    Alert.alert(
      'Account Information',
      `Name: ${displayName}\n\nEmail: ${user?.email || 'N/A'}\n\nUser ID: ${user?.uid || 'N/A'}`,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handleSettingsPress = () => {
    Alert.alert(
      'Settings',
      'App Settings',
      [
        {
          text: 'Notifications',
          onPress: () => {
            Alert.alert('Notifications', 'Notification settings will be available soon.');
          },
        },
        {
          text: 'Theme',
          onPress: () => {
            Alert.alert('Theme', 'Theme settings will be available soon.');
          },
        },
        {
          text: 'Language',
          onPress: () => {
            Alert.alert('Language', 'Language settings will be available soon.');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleHelpSupportPress = () => {
    Alert.alert(
      'Help & Support',
      'Need assistance?',
      [
        {
          text: 'FAQs',
          onPress: () => {
            Alert.alert(
              'Frequently Asked Questions',
              'Q: How do I create a project?\nA: Tap the "+" button on the Projects screen.\n\nQ: How do I assign tasks?\nA: When creating or editing a task, type the assignee name in the assignee field.\n\nQ: How do I move tasks?\nA: Drag and drop tasks between columns in the Kanban board.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'Contact Support',
          onPress: () => {
            Alert.alert(
              'Contact Support',
              `Email: support@mgroad.com\n\nWe'll get back to you within 24 hours.`,
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'About',
          onPress: () => {
            Alert.alert(
              'About',
              'MG Road\nVersion 1.0.0\n\nA project management app for teams.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = getDisplayName(user?.email || undefined);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + scalePadding(20) }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            style={styles.profileImageWrapper}
            onPress={showImagePickerOptions}
            activeOpacity={0.8}
            disabled={uploading}
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={scaleSize(60)} color="#A0A0A0" />
              </View>
            )}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={showImagePickerOptions}
            activeOpacity={0.8}
            disabled={uploading}
          >
            <MaterialIcons name="camera-alt" size={scaleSize(20)} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* User Name */}
        <Text style={styles.userName}>{displayName}</Text>

        {/* Email */}
        <Text style={styles.userEmail}>{user?.email}</Text>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handleAccountPress}
          >
            <MaterialIcons name="person" size={scaleSize(24)} color="#007AFF" />
            <Text style={styles.menuItemText}>Account</Text>
            <MaterialIcons name="chevron-right" size={scaleSize(24)} color="#A0A0A0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handleSettingsPress}
          >
            <MaterialIcons name="settings" size={scaleSize(24)} color="#007AFF" />
            <Text style={styles.menuItemText}>Settings</Text>
            <MaterialIcons name="chevron-right" size={scaleSize(24)} color="#A0A0A0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handleHelpSupportPress}
          >
            <MaterialIcons name="help-outline" size={scaleSize(24)} color="#007AFF" />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={scaleSize(24)} color="#A0A0A0" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: scalePadding(20),
    paddingBottom: scalePadding(20),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 2,
    borderBottomColor: '#404040',
    zIndex: 10,
    minHeight: scaleSize(80),
  },
  headerTitle: {
    fontSize: scaleFont(28),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scalePadding(24),
    paddingBottom: scaleSize(100),
    alignItems: 'stretch',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: scaleMargin(24),
    width: '100%',
  },
  profileImageWrapper: {
    width: scaleSize(120),
    height: scaleSize(120),
    borderRadius: scaleSize(60),
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: scaleSize(60),
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaleSize(60),
  },
  editIconButton: {
    position: 'absolute',
    bottom: scaleSize(-12),
    right: '50%',
    marginRight: scaleSize(-68),
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  userName: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: scaleMargin(8),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#A0A0A0',
    marginBottom: scaleMargin(32),
    textAlign: 'center',
  },
  menuContainer: {
    width: '100%',
    gap: scaleSize(12),
    marginBottom: scaleMargin(32),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(12),
    paddingHorizontal: scalePadding(20),
    paddingVertical: scalePadding(16),
    width: '100%',
    minHeight: scaleSize(56),
  },
  menuItemText: {
    flex: 1,
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: scaleSize(16),
    textAlign: 'left',
  },
  logoutButton: {
    marginTop: 'auto',
    paddingVertical: scalePadding(16),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoutText: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: '#d32f2f',
  },
});
