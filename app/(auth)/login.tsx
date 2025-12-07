import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput as RNTextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { scaleSize, scaleFont, scalePadding, scaleMargin, widthPercentage } from '@/utils/responsive';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      router.replace('/(tabs)/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/Screenshot 2025-12-06 185319.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={[
              styles.inputWrapper,
              emailFocused && styles.inputWrapperFocused
            ]}>
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

          <View style={styles.inputContainer}>
            <View style={[
              styles.inputWrapper,
              passwordFocused && styles.inputWrapperFocused
            ]}>
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

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?{' '}
              <Text style={styles.signupLink} onPress={() => router.push('/(auth)/signup')}>
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: scalePadding(24),
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: scalePadding(30),
  },
  header: {
    marginBottom: scaleMargin(32),
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: scaleSize(180),
    maxWidth: '30%',
    marginBottom: scaleMargin(-70),
    alignSelf: 'center',
  },
  title: {
    fontSize: scaleFont(30),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: scaleMargin(4),
  },
  subtitle: {
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#A3A3A3',
  },
  form: {
    gap: scaleSize(24),
    marginBottom: scaleMargin(32),
  },
  inputContainer: {
    gap: scaleSize(8),
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#171717',
    minHeight: scaleSize(56),
    paddingHorizontal: scalePadding(16),
  },
  inputWrapperFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: scaleSize(56),
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#FFFFFF',
    padding: 0,
  },
  error: {
    color: '#EF4444',
    fontSize: scaleFont(14),
    textAlign: 'center',
    marginTop: scaleMargin(8),
  },
  footer: {
    alignItems: 'center',
    gap: scaleSize(24),
  },
  button: {
    width: '100%',
    height: scaleSize(56),
    backgroundColor: '#007AFF',
    borderRadius: scaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: scaleFont(14),
    color: '#A3A3A3',
    textAlign: 'center',
  },
  signupLink: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#007AFF',
  },
});

