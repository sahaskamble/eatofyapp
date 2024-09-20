import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, Dimensions, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import './global.css';
import { Ionicons } from '@expo/vector-icons';
import { ApiUrl } from '@/constants/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Login() {

  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [Message, setMessage] = useState('');

  async function handleLogin() {
    setisLoading(true);
    try {
      const response = await fetch(`${ApiUrl}/api/hotel/authentication/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        const jwt = data?.output[1].token;
        const hotel_id = data?.output[0].result[0].HotelId;
        const userData = JSON.stringify(data?.output[0].result[0]);
        SetUserData(jwt, hotel_id, userData);
        Alert.alert(data.message);
        router.navigate('/(tabs)/');
      }
    } catch (e: any) {
      throw console.error(e);
    }
  }

  async function SetUserData(token: any, id: any, data: any) {
    try {
      await AsyncStorage.setItem('jwt', token);
      await AsyncStorage.setItem('hotel_id', id);
      await AsyncStorage.setItem('UserData', data);
      await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
      // console.warn(await AsyncStorage.getItem('jwt'));
      // console.warn(await AsyncStorage.getItem('hotel_id'));
    } catch (e: any) {
      throw console.error(e);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Eatofy</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={24} color="#f07065" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
          defaultValue={email}
          onChangeText={(e: any) => { setemail(e) }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#f07065" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          secureTextEntry
          defaultValue={password}
          onChangeText={(e: any) => { setpassword(e) }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // White background
  },
  title: {
    fontSize: width * 0.08, // Responsive font size
    fontWeight: 'bold',
    color: '#f07065', // Red text for title
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Light gray input background
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f07065', // Red border for inputs
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333', // Dark text for inputs
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#f07065', // Red text for forgot password link
    fontSize: 14,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#f07065', // Red button
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 50,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff', // White text for button
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#333', // Dark gray text for sign up link
    fontSize: 16,
    marginTop: 10,
  },
});
