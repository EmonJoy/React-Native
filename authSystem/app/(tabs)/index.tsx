import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


import { auth } from '@/constants/firebase';


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            alert('Please fill in all fields!');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address!');
            return;
        }

        try {
          setLoading(true);
          
          // ফায়ারবেস দিয়ে লগইন করার অফিশিয়াল মেথড
          await signInWithEmailAndPassword(auth, email, password);
          
          
          router.replace('/dashboard'); // লগইন সফল হলে dashboard পেজে নিয়ে যাবে
          
        } catch (error) {
              console.error(error);
              // ফায়ারবেসের নির্দিষ্ট এরর হ্যান্ডেলিং
              const authError = error as { code?: string; message?: string };
              if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
                  alert('Invalid email or password. Please try again!');
              } else {
                  alert(authError.message ?? 'An unexpected error occurred.');
              }
        } finally {
            setLoading(false);
        } 
    };

    return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.SafeArea}>
        <View style={styles.container}>
          <Text style={styles.textLogin}>Login</Text>

          <View style={styles.formGroup}>
            <Text style={styles.text}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter Email'
              placeholderTextColor="#64748b"
              autoCapitalize='none'
              value={email}
              onChangeText={(text) => setEmail(text)}
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.text}>Password:</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter password'
              placeholderTextColor="#64748b"
              autoCapitalize='none'
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
              editable={!loading}
            />
          </View>

          <Pressable style={styles.loginbtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.btnTxt}>Login</Text>
            )}
          </Pressable>

          <Pressable 
            style={styles.linkContainer}
            onPress={() => router.push('/register')}
            disabled={loading}
          >
            <Text style={styles.registerLink}>Don&apos;t have an account? Register</Text>
          </Pressable>

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  SafeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 25, 
    paddingTop: 60,        
    alignItems: 'center', 
  },
  textLogin: {
    color: '#f8a538',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40, 
  },
  formGroup: {
    width: '80%', 
    marginBottom: 20,
  },
  text: {
    color: '#f8a538',
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'flex-start', 
    marginBottom: 6,
  },
  input: {
    width: '100%', 
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  loginbtn: {
    width: '80%',
    backgroundColor: '#FF00FF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    elevation: 3, 
  },
  btnTxt: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 25, 
  },
  registerLink: {
    color: '#38bdf8', 
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline', 
  },
});
