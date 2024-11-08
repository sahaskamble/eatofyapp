import { Text, View, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert, Dimensions, Image, ActivityIndicator, StatusBar, InteractionManager } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ImageBackground } from "react-native";
import { ApiHost } from "@/constants/urls";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default function Index() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const { getItem: getUserData, setItem: setUserData } = useAsyncStorage('@USerData');
  const { getItem: getLoggedIn, setItem: setLoggedIn } = useAsyncStorage('@LoggedIn');
  const { setItem: setHote_id } = useAsyncStorage('@Hotel_id');

  async function handleLogin() {
    setisLoggedIn(true);
    try {

      const response = await fetch(`${ApiHost}/api/hotel/authentication/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setisLoggedIn(false);
        console.log(data?.output[0]?.result);
        // const hotel_id = data?.output[0]?.result.HotelId;
        // console.log('Hotel Id', );
        await setUserData(JSON.stringify(data));
        await setLoggedIn(JSON.stringify(true));
        await setHote_id(data?.output[0]?.result[0]?.HotelId);
        router.navigate('/MainPage');
      } else {
        Platform.OS === 'android' ? (
          Alert.alert(`${data.message}`)
        ) : (
          Alert.prompt(`${data.message}`)
        )
      }

    } catch (e: any) {
      throw console.error(e);
    }
  }

  async function LoadUserData() {
    try {

      const response: any = await getUserData();
      const logged: any = await getLoggedIn();
      setisLoggedIn(logged);
      console.log(JSON.parse(response));

    } catch (e: any) {
      throw console.error(e);
    }
  }

  useEffect(() => {
    LoadUserData();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.navigate('/MainPage');
    }
  }, [isLoggedIn])

  if (isLoggedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={80} color={'#f53a3a'} />
      </View>
    )
  }
  return (
    <>
      <StatusBar translucent={true} backgroundColor={'#000'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={require('../assets/images/dish1.jpg')}
          resizeMode="cover"
          width={width}
          style={{ flex: 1, justifyContent: 'center', padding: 8 }}
        >
          <BlurView intensity={100} experimentalBlurMethod="dimezisBlurView" tint="systemThinMaterialDark" style={{ overflow: 'hidden', borderRadius: 20 }}>
            <View style={styles.container}>

              <Image source={require('../assets/images/eatofy_logo.png')} resizeMode="center" style={{ width: 250 }} />

              <Text style={{ fontFamily: 'Semi-Bold', fontSize: 25, marginBottom: 20, color: '#fff' }}>
                Login to Waiter app
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={text => setemail(text)}
              />
              <View style={styles.PasswordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!isPasswordVisible}
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={text => setPassword(text)}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!isPasswordVisible)}  // Toggle visibility
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={24}
                    color="#f53a3a"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submit} onPress={handleLogin}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </ImageBackground>

      </KeyboardAvoidingView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#fff',
    height: height - 300,
    // borderTopRightRadius: 80,
    width: width - 15,
  },
  input: {
    width: '90%',
    marginHorizontal: 'auto',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 20,
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  PasswordContainer: {
    flexDirection: 'row',
  },
  submit: {
    width: '90%',
    backgroundColor: '#f53a3a',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderWidth: 1,
    // borderColor: '#bbb',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30
  },
  submitText: {
    fontFamily: 'Semi-Bold',
    fontSize: 18,
    color: '#fffefe',
    textAlign: 'center',
  },
})


// <BlurView intensity={90} experimentalBlurMethod="dimezisBlurView" tint="systemUltraThinMaterial" style={{ overflow: 'hidden', borderTopLeftRadius: 80, }}>
//
// </BlurView>
