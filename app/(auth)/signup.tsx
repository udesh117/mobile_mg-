import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput as RNTextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { scaleSize, scaleFont, scalePadding, scaleMargin } from '@/utils/responsive';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const { setUser } = useAuthStore();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      router.replace('/(tabs)/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused
              ]}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="mail" size={20} color="#A3A3A3" />
                </View>
                <RNTextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#737373"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused
              ]}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="lock" size={scaleSize(20)} color="#A3A3A3" />
                </View>
                <RNTextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#737373"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                confirmPasswordFocused && styles.inputWrapperFocused
              ]}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="lock" size={scaleSize(20)} color="#A3A3A3" />
                </View>
                <RNTextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#737373"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
              </View>
            </View>

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>
                Already have an account?{' '}
                <Text style={styles.signinLink} onPress={() => router.push('/(auth)/login')}>
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: scalePadding(24),
  },
  content: {
    flex: 1,
    width: '100%',
    paddingTop: scalePadding(64),
  },
  header: {
    alignItems: 'center',
    marginBottom: scaleMargin(32),
  },
  title: {
    fontSize: scaleFont(30),
    fontWeight: '700',
    color: '#F5F5F5',
    letterSpacing: -0.015,
    lineHeight: scaleSize(38),
    marginBottom: scaleMargin(8),
  },
  subtitle: {
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#A3A3A3',
    lineHeight: scaleSize(24),
  },
  form: {
    gap: scaleSize(16),
    marginBottom: scaleMargin(32),
  },
  inputGroup: {
    gap: scaleSize(8),
  },
  label: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#E5E5E5',
    lineHeight: scaleSize(20),
    paddingBottom: scalePadding(8),
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: '#000000',
    minHeight: scaleSize(56),
  },
  inputWrapperFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  iconContainer: {
    paddingLeft: scalePadding(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: scaleSize(56),
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#F5F5F5',
    paddingHorizontal: scalePadding(12),
    paddingVertical: 0,
  },
  error: {
    color: '#EF4444',
    fontSize: scaleFont(14),
    textAlign: 'center',
    marginTop: scaleMargin(8),
  },
  footer: {
    alignItems: 'center',
    gap: scaleSize(16),
    marginTop: scaleMargin(32),
    paddingBottom: scalePadding(32),
  },
  button: {
    width: '100%',
    height: scaleSize(56),
    backgroundColor: '#007AFF',
    borderRadius: scaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signinContainer: {
    alignItems: 'center',
  },
  signinText: {
    fontSize: scaleFont(14),
    color: '#A3A3A3',
    textAlign: 'center',
  },
  signinLink: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#007AFF',
  },
});

