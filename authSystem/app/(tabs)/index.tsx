import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handelLogin = () =>{
        alert(`Email: ${email} \nPassword: ${password}`)
    };

    return (

    <SafeAreaProvider>
      <SafeAreaView style={styles.SafeArea}>
        <View style={styles.container}>
          <Text style={styles.textLogin}>Register</Text>

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
            <Text style={styles.btnTxt}>Login</Text>

          </Pressable>

          <Pressable style={styles.regLink}
          onPress={() => router.push('/register')}
          
          >
            <Text>Do not have account? Register</Text>

          </Pressable>


        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  SafeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // নচ বা স্ট্যাটাস বারের ব্যাকগ্রাউন্ড কালার মেইনটেইন করবে
  },
  input:{
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 10,
    justifyContent:"center",
    alignItems:"center",
  },

  regLink: {
    backgroundColor: '#f8f538',
    fontSize: 16,
    textDecorationLine: 'underline',

  },

  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 25, // স্ক্রিনের দুই পাশে সুন্দর একটা খালি জায়গা (গ্যাপ) রাখবে
    paddingTop: 20,        // নচ থেকে ঠিক কতটুকু নিচে লেখা শুরু হবে তা নিয়ন্ত্রণ করবে
    alignItems: 'center', // লেখাগুলোকে বাম দিকে (Left Align) রাখার জন্য (মাঝখানে নিতে চাইলে 'center' দিন)
    
  },

  textLogin: {
    color: '#f8a538',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10, // Login লেখার নিচে একটু ফাঁকা জায়গা তৈরি করবে
    alignItems:'center'
  },

  text: {
    color: '#f8a538',
    fontSize: 16,
    alignSelf: 'flex-start', // লেবেলগুলোকে বাম পাশে সুন্দর করে সাজানোর জন্য
    marginBottom: 5,
  },
  loginbtn:{
    width:'100%',
    paddingVertical: 12,
    marginTop: 10,
    elevation: 3,
    backgroundColor:'#FF00FF',
    padding: 4
    
  },

  btnTxt:{
        color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent:'center',
    alignItems:'center',
    boxShadow: '2',
    textAlign:'center'
  }
});
