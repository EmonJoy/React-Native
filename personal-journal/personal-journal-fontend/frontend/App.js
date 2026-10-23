
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// Save token according to platform
async function saveToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem('authToken', token);
  } else {
    await SecureStore.setItemAsync('authToken', token);
  }
}

// Read saved token
async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem('authToken');
  }

  return await SecureStore.getItemAsync('authToken');
}

// Remove saved token
async function removeToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('authToken');
  } else {
    await SecureStore.deleteItemAsync('authToken');
  }
}

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [savedToken, setSavedToken] = useState(null);
  const [savedUsername, setSavedUsername] = useState('');

  // Check for a saved login when the app starts
  useEffect(() => {
    async function checkLogin() {
      try {
        const token = await getToken();

        if (token) {
          setSavedToken(token);

          if (Platform.OS === 'web') {
            setSavedUsername(
              localStorage.getItem('authUsername') || ''
            );
          }
        }
      } catch (error) {
        console.error('Token read error:', error);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkLogin();
  }, []);

  const handleLogin = async () => {
    setMessage('');
    setIsSuccess(false);

    if (!username.trim() || !password) {
      setMessage('Please enter username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/login/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log('API status:', response.status);

      if (!response.ok) {
        setMessage(
          data.non_field_errors?.[0] ||
          data.detail ||
          data.error ||
          JSON.stringify(data)
        );
        return;
      }

      if (!data.token) {
        setMessage('Login failed: No token received.');
        return;
      }

      // Save token and username
      await saveToken(data.token);

      if (Platform.OS === 'web') {
        localStorage.setItem('authUsername', data.username);
      }

      setSavedUsername(data.username);
      setSavedToken(data.token);

      setIsSuccess(true);
      setMessage(`Login successful! Welcome, ${data.username}.`);

      console.log('Login successful. Token saved.');
    } catch (error) {
      console.error('Login error:', error);

      setMessage(
        `Login failed: ${error.message}. Check your connection and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await removeToken();

      if (Platform.OS === 'web') {
        localStorage.removeItem('authUsername');
      }

      setSavedToken(null);
      setSavedUsername('');
      setUsername('');
      setPassword('');
      setMessage('');
      setIsSuccess(false);
    } catch (error) {
      console.error('Logout error:', error);
      setMessage('Could not log out. Please try again.');
    }
  };

  // Initial authentication check
  if (checkingAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.subtitle}>
            Checking saved login...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show this screen when a token exists
  if (savedToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Personal Journal</Text>

          <Text style={styles.subtitle}>
            Welcome back{savedUsername ? `, ${savedUsername}` : ''}!
          </Text>

          <Text style={styles.message}>
            Your login is saved on this device.
          </Text>

          <Text style={styles.footer}>
            Next, we will connect your Notes screen to the API.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Login screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Personal Journal</Text>

        <Text style={styles.subtitle}>
          Welcome back! Please log in.
        </Text>

        <Text style={styles.label}>Username</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleLogin}
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Log In'}
          </Text>
        </TouchableOpacity>

        {message ? (
          <Text
            style={[
              styles.message,
              isSuccess
                ? styles.successMessage
                : styles.errorMessage,
            ]}
          >
            {message}
          </Text>
        ) : null}

        <Text style={styles.footer}>
          Your personal thoughts, all in one place.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  message: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },

  successMessage: {
    color: '#15803D',
  },

  errorMessage: {
    color: '#DC2626',
  },

  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 24,
  },
});
