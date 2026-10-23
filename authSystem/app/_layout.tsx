
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Login protection
  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === '(tabs)';

    if (!user && inTabs) {
      router.replace('/');
    }

    if (user && !inTabs) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  // Loading screen
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // App screens
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
