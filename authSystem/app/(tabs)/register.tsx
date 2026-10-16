import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handelLogin = () => {
       if(!email.trim() && !password.trim()){
            alert("Email and password are not properly field");
            return ;
       }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('it is not a mail!');
            return;
        }
    };

    return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.SafeArea}>
        <View style={styles.container}>
          <Text style={styles.textLogin}>Login</Text>

          <Text style={styles.text}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter Email'
            autoCapitalize='none'
            value={email}
            onChangeText={(text) => setEmail(text)}
          />

          <Text style={styles.text}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter password'
            autoCapitalize='none'
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />

          <Pressable style={styles.loginbtn} onPress={handelLogin}>
            <Text style={styles.btnTxt}>Register</Text>
          </Pressable>

          {/* ১. স্টাইলটি প্রেসাবলের বদলে নিচের টেক্সট ট্যাগে দেওয়া হয়েছে */}
          <Pressable 
            style={styles.linkContainer}
            onPress={() => router.push(' ')} // ২. এখানে আপনার সাইনআপ পেজের পাথ বসবে
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
    backgroundColor: '#bfc4bf', 
  },

  container: {
    flex: 1,
    backgroundColor: '#bfc4bf',
    paddingHorizontal: 25, 
    paddingTop: 40,        
    alignItems: 'center', 
  },

  textLogin: {
    color: '#f8a538',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20, 
  },

  text: {
    color: '#f8a538',
    fontSize: 16, // সাইজ ছোট করা হয়েছে লেবেলের সুবিধার্থে
    alignSelf: 'center', 
    marginBottom: 5,
  },

  input: {
    width: '60%', // ইনপুট বক্স স্ক্রিনের সাথে সামঞ্জস্যপূর্ণ করা হয়েছে
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 15,
  },

  loginbtn: {
    width: '60%',
    backgroundColor: '#FF00FF',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
    elevation: 3, 
    alignItems: 'center',
  },

  btnTxt: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
  },

  linkContainer: {
    marginTop: 20, // বাটন থেকে লিংকের দূরত্ব তৈরি করবে
  },

  loginLink: {
    color: '#1e3a8a', // ডিপ ব্লু কালার দেওয়া হয়েছে রিডাবিলিটির জন্য
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline', // লিংকের মতো আন্ডারলাইন দেখাবে
  },
});
