
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function IndexScreen() {
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    async function checkToken() {
      try {
        let token;

        if (Platform.OS === 'web') {
          token = localStorage.getItem('authToken');
        } else {
          token = await SecureStore.getItemAsync('authToken');
        }

        setDestination(token ? '/notes' : '/login');
      } catch (error) {
        console.error('Auth check failed:', error);
        setDestination('/login');
      }
    }

    checkToken();
  }, []);

  if (!destination) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
