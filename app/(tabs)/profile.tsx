import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Profile
          </Text>
          <Text variant="bodyLarge" style={styles.email}>
            {user?.email}
          </Text>
          <Text variant="bodyMedium" style={styles.uid}>
            ID: {user?.uid}
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#d32f2f"
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
  },
  email: {
    marginBottom: 8,
  },
  uid: {
    color: '#666',
    fontSize: 12,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});

