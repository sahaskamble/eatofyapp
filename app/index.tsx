import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';

export default function Index() {

  const [isLogged, setisLogged] = useState(false);

  async function LoadUserData() {
    try {
      const loginCheck: any = await AsyncStorage.getItem('isLoggedIn');
      const isLoggedIn: any = JSON.parse(loginCheck);
      const userData: any = await AsyncStorage.getItem('UserData');
      setisLogged(isLoggedIn);
      // const data = await JSON.parse(userData);
      // console.warn(data, isLoggedIn)
    } catch (e: any) {
      throw console.warn(e);
    }
  }

  useEffect(() => {
    LoadUserData();
  }, [])

  if (isLogged) {
    return <Redirect href={'/(tabs)/'} />
  } else {
    return <Redirect href={'/login'} />
  }
}
