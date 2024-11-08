import { Stack, router } from "expo-router";
import { useFonts } from 'expo-font';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef, useState } from "react";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { ApiHost } from "@/constants/urls";

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    'G-Bold': require('@/assets/fonts/GowunBatang/GowunBatang-Bold.ttf'),
    'G-Regular': require('@/assets/fonts/GowunBatang/GowunBatang-Regular.ttf'),
    'P-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    'P-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Semi-Bold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Light': require('@/assets/fonts/Poppins/Poppins-Light.ttf'),
  });

  //AsyncStorage Data 
  const { getItem: getHotel_id } = useAsyncStorage('@Hotel_id');

  //hooks
  const animation = useRef<LottieView>(null);
  const [HotelName, setHotelName] = useState('');
  const [HotelLogo, setHotelLogo] = useState('');

  async function fetchHotelInfo() {
    try {

      const hotel_id = await getHotel_id();

      //HotelInfo
      const hotel = await fetch(`${ApiHost}/api/eatofy/hotels/management/fetch/id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'hotel_id': hotel_id,
        }),
      });

      if (hotel.ok) {
        const hotelData = await hotel.json();
        console.log(hotelData);
        setHotelLogo(hotelData?.output[0]?.HotelLogo);
        setHotelName(hotelData?.output[0]?.HotelName);
      }

    } catch (e: any) {
      throw console.error(e);
    }
  }

  useEffect(() => {
    fetchHotelInfo();
  }, [])

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>Welcome to Eatofy</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerShown: false,
      }} />

      <Stack.Screen name="MainPage" options={{
        headerTitle: `${HotelName}`,
        headerTitleAlign: 'left',
        headerBackVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              router.navigate('/profile');
            }}
            style={{ borderColor: '#000', borderWidth: 1, borderRadius: 50, }}
          >
            {
              HotelLogo === '' ? (
                <Text>Logo</Text>
              ) : (
                <Image
                  width={40}
                  height={40}
                  resizeMode="cover"
                  source={{ uri: `data:image/*;base64,${HotelLogo}` }}
                  style={{ borderRadius: 50, }}
                />
              )
            }
          </TouchableOpacity>
        ),
      }} />

      <Stack.Screen name="Dishes" options={{
      }} />

      <Stack.Screen name="profile" options={{
        presentation: 'containedModal'
      }} />
    </Stack>
  );
}
