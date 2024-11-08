import { View, Text, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function Profile() {

  //Hooks
  const [Hotel_id, setHotel_id]: any = useState('');
  const [HotelData, setHotelData]: any = useState([]);

  //Asyncstorage Data
  const { getItem: getUserData } = useAsyncStorage('@UserData');
  const { getItem: getHotel_id } = useAsyncStorage('@Hotel_id');
  const { removeItem } = useAsyncStorage('@LoggedIn');

  async function LoadUserData() {
    try {

      const id: any = await getHotel_id();
      const userdata = await getUserData();

      setHotel_id(id);
      setHotelData(userdata);

    } catch (e: any) {
      throw console.error(e);
    }
  }

  useEffect(() => {
    LoadUserData();
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Text>Profile</Text>
      <Button title='Logout' color={'#f53a3a'} onPress={async () => {
        await removeItem();
        router.push('/')
      }} />
    </View>
  )
}
