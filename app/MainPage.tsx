import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ApiHost } from '@/constants/urls';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import Fontisto from '@expo/vector-icons/Fontisto';
import { ActivityIndicator } from 'react-native';

export default function MainPage() {

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tables, settables]: any = useState([]);
  const [showTables, setshowTables]: any = useState([]);
  const [showTableSearch, setshowTableSearch]: any = useState([]);
  const [sections, setsections]: any = useState([]);
  const [hotel_id, sethotel_id] = useState('');
  const [HotelData, setHotelData]: any = useState([]);
  const [activeIndex, setactiveIndex] = useState(0);
  const [isLoaded, setisLoaded] = useState(false);

  //AsyncStorage Data
  const { getItem: getUserData } = useAsyncStorage('@UserData');
  const { getItem: getHotel_id } = useAsyncStorage('@Hotel_id');
  const { getItem: getTableinfo, setItem: setTableinfo, removeItem: removeTableinfo } = useAsyncStorage('@TableInfo');
  const { removeItem } = useAsyncStorage('@LoggedIn');

  async function LoadUserData() {
    try {

      const id: any = await getHotel_id();
      const userdata = await getUserData();
      const tabledata: any = await getTableinfo();

      sethotel_id(id);
      setHotelData(userdata);

    } catch (e: any) {
      throw console.error(e);
    }
  }

  async function fetchMainData() {
    setisLoaded(true);
    try {

      const sectionsResponse = await fetch(`${ApiHost}/api/hotel/sections/management/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'hotel_id': hotel_id }),
      });

      const tablesResponse = await fetch(`${ApiHost}/api/hotel/tables/management/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'hotel_id': hotel_id }),
      });

      if (sectionsResponse.ok) {
        const section = await sectionsResponse.json();
        setsections(section);
      }

      if (tablesResponse.ok) {
        const table = await tablesResponse.json();
        settables(table);
      }

      setisLoaded(false);
    } catch (e: any) {
      throw console.error(e);
    }
  }

  function handleSectionFilter(sectionid: any) {
    const filteredTable = tables?.output.filter((t: any) => t.SectionId === sectionid);
    setshowTables(filteredTable);
  }

  useEffect(() => {
    LoadUserData();
    if (hotel_id) {
      fetchMainData();
    }
  }, [hotel_id])

  return (
    <>
      <TextInput
        style={styles.searchBar}
        placeholder='Search...'
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={{ paddingHorizontal: 0 }}>
        <ScrollView
          horizontal={true}
          contentContainerStyle={styles.sectionsContainer}
          showsHorizontalScrollIndicator={false}
        >
          <>
            <TouchableOpacity
              style={[styles.sectionName, { backgroundColor: activeIndex === 0 ? '#f53a3a' : '#fff', }]}
              onPress={() => { setactiveIndex(0); setshowTables([]); }}
            >
              <Text style={{
                color: activeIndex === 0 ? '#fff' : '#000',
                fontWeight: 'bold',
              }}
              >All</Text>
            </TouchableOpacity>
            {
              sections?.output?.map((sec: any, index: any) => (
                <TouchableOpacity
                  key={index + 1}
                  style={[styles.sectionName, { backgroundColor: activeIndex === index + 1 ? '#f53a3a' : '#fff', }]}
                  onPress={() => { setactiveIndex(index + 1); handleSectionFilter(sec.id); }}
                >
                  <Text style={{
                    color: activeIndex === index + 1 ? '#fff' : '#000',
                    fontWeight: 'bold',
                  }}
                  >{sec.SectionName}</Text>
                </TouchableOpacity>
              ))
            }
          </>
        </ScrollView>
      </View>
      <ScrollView
        contentContainerStyle={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 20,
          paddingHorizontal: 0,
          paddingVertical: 25,
        }}
        showsVerticalScrollIndicator={false}
      >
        {
          isLoaded ? (
            <View>
              <ActivityIndicator size={40} color={'#f53a3a'} />
            </View>
          ) : (
            showTables.length === 0 ? (
              tables?.output?.filter((t: any) => t.TableName.toLowerCase().includes(searchQuery.toLowerCase())).map((tbl: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: 100,
                    height: 100,
                    borderColor: '#000',
                    backgroundColor: tbl.Status === 'Booked' ? '#f53a3a' : (tbl.Status === 'Bill Pending' ? 'green' : '#fff'),
                    borderRadius: 10,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowRadius: 0.8,
                    shadowOpacity: 0.2,
                    elevation: 6,
                  }}
                  onPress={() => {
                    const tabledata: any = [
                      {
                        id: tbl.id,
                        name: tbl.TableName,
                        status: tbl.Status,
                        sectionid: tbl.SectionId,
                        Type: 'Dine-In'
                      },
                    ];

                    setTableinfo(JSON.stringify(tabledata));
                    router.navigate('/Dishes');
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      paddingBottom: 10,
                      fontWeight: 'bold',
                      color: tbl.Status === 'Booked' ? '#fff' : (tbl.Status === 'Bill Pending' ? '#fff' : '#000'),
                    }}
                  >{tbl.TableName}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Fontisto name="persons" size={20} color={tbl.Status === 'Booked' ? '#fff' : (tbl.Status === 'Bill Pending' ? '#fff' : '#000')} />
                    <Text
                      style={{
                        fontSize: 18,
                        color: tbl.Status === 'Booked' ? '#fff' : (tbl.Status === 'Bill Pending' ? '#fff' : '#000'),
                      }}
                    >{tbl.PersonsOccupiable}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              showTables?.filter((t: any) => t.TableName.toLowerCase().includes(searchQuery.toLowerCase())).map((tbl: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: 100,
                    height: 100,
                    borderColor: '#000',
                    backgroundColor: tbl.Status === 'Booked' ? '#f53a3a' : (tbl.Status === 'Bill Pending' ? 'green' : '#fff'),
                    borderRadius: 10,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowRadius: 0.8,
                    shadowOpacity: 0.2,
                    elevation: 6,
                  }}
                  onPress={() => {
                    const tabledata: any = [
                      {
                        id: tbl.id,
                        name: tbl.TableName,
                        status: tbl.Status,
                        sectionid: tbl.SectionId,
                        Type: 'Dine-In'
                      },
                    ];

                    setTableinfo(JSON.stringify(tabledata));
                    router.navigate('/Dishes');
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      paddingBottom: 10,
                      fontWeight: 'bold',
                      color: tbl.Status === 'Booked' ? '#fff' : (tbl.Status === 'Bill Pending' ? '#fff' : '#000'),
                    }}
                  >{tbl.TableName}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Fontisto name="persons" size={24} color={tbl.Status === 'Booked' ? '#fff' : (tbl.Status === 'Bill Pending' ? '#fff' : '#000')} />
                    <Text
                      style={{
                        fontSize: 20,
                        color: tbl.Status === 'Booked' ? '#fff' : (tbl.Status === 'Bill Pending' ? '#fff' : '#000'),
                      }}
                    >{tbl.PersonsOccupiable}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )
          )
        }
      </ScrollView >
    </>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.80,
    shadowRadius: 4.65,
    elevation: 10,
  },

  sectionsContainer: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  sectionName: {
    width: 100,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});
