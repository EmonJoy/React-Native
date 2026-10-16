import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { auth } from '@/constants/firebase';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email.trim() || !password.trim()) {
            alert('Please fill in all fields!');
            return;
        }
        // ইমেইল RegEx এর ভুল ঠিক করা হয়েছে
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address!');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }
        
        try {
          setLoading(true);
          await createUserWithEmailAndPassword(auth, email, password);
          alert('Registration & Firebase DB Save Successful!');
          router.replace('/'); // সফল হলে লগইন পেজে নিয়ে যাবে
        } catch (error) {
              console.error(error);
            const authError = error as { code?: string; message?: string };
            if (authError.code === 'auth/email-already-in-use') {
                  alert('That email address is already in use!');
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
          <Text style={styles.textLogin}>Register</Text>

          {/* লেআউট সুন্দর রাখার জন্য ফর্ম গ্রুপ ব্যবহার করা হয়েছে */}
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

          <Pressable style={styles.loginbtn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.btnTxt}>Register</Text>
            )}
          </Pressable>

          <Pressable 
            style={styles.linkContainer}
            onPress={() => router.push('/')} 
            disabled={loading}
          >
            <Text style={styles.loginLink}>Already have account? Login</Text>
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
  loginLink: {
    color: '#38bdf8', 
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline', 
  },
});
