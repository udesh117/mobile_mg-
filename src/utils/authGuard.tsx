import { useEffect, useState } from 'react';
import { useSegments, usePathname, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const [isRouterReady, setIsRouterReady] = useState(false);

  // Wait for router to be ready - check for valid pathname and segments
  useEffect(() => {
    // Router is ready when we have a valid pathname (not empty or undefined)
    // and segments array is available (even if empty)
    if (pathname && pathname !== '' && segments.length >= 0) {
      // Increased delay to ensure routes are fully registered
      const timer = setTimeout(() => {
        setIsRouterReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsRouterReady(false);
    }
  }, [segments, pathname]);

  // Show loading while checking auth state or waiting for router
  if (isLoading || !isRouterReady || !pathname || pathname === '') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Don't redirect if we're already on the index page (it handles its own redirect)
  if (pathname === '/' || pathname === '/index') {
    return <>{children}</>;
  }

  const inAuthGroup = segments[0] === '(auth)';
  const inTabsGroup = segments[0] === '(tabs)';

  // Only redirect if we have valid segments indicating route structure is ready
  // Redirect unauthenticated users away from protected routes
  if (!user && !inAuthGroup && pathname !== '/' && pathname !== '/index') {
    // Only redirect if we can see the route structure (segments are populated)
    if (segments.length > 0 || pathname.startsWith('/project')) {
      return <Redirect href="/(auth)/login" />;
    }
    // If segments aren't ready yet, just render children
    return <>{children}</>;
  }

  // Redirect authenticated users away from auth routes
  if (user && inAuthGroup) {
    // Only redirect if we can see the route structure
    if (segments.length > 0) {
      return <Redirect href="/(tabs)/projects" />;
    }
    return <>{children}</>;
  }

  return <>{children}</>;
}

