import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, Button, Dimensions, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from 'react';
import { ApiHost } from '@/constants/urls';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default function Dishes() {

  const [Menus, setMenus]: any = useState([]);
  const [filteredMenu, setfilteredMenu]: any = useState([]);
  const [categorys, setcategorys]: any = useState([]);
  const [Cart, setCart]: any = useState([]);
  const [isLoaded, setisLoaded] = useState(false);
  const [section_id, setsection_id] = useState('');
  const [table_id, settable_id] = useState('');
  const [tableName, settableName] = useState('');
  const billkot: any = useRef();

  //AsyncStorage Data
  const { getItem: getTableInfo } = useAsyncStorage('@TableInfo');
  const { getItem: getHotel_id } = useAsyncStorage('@Hotel_id');

  // State hooks
  const [dishSearchQuery, setDishSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDishes, setSelectedDishes] = useState<{ name: string; price: number }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  async function fetchMenuandCategory() {
    setisLoaded(true);
    try {

      const hotel_id = await getHotel_id();

      const menuResponse = await fetch(`${ApiHost}/api/hotel/menu/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 'hotel_id': hotel_id }),
      });

      const categoryResponse = await fetch(`${ApiHost}/api/hotel/dish/category/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 'hotel_id': hotel_id }),
      });

      if (menuResponse.ok) {
        const data = await menuResponse.json();
        setMenus(data?.output[0]?.Menus);
      }

      if (categoryResponse.ok) {
        const data = await categoryResponse.json();
        setcategorys(data?.output);
      }

      setisLoaded(false);

    } catch (e: any) {
      throw console.error(e);
    }
  }

  function handleFilterByCategory(categoryId: any) {
    const filteredmenu: any = Menus?.filter((m: any) => m.Dish.CategoryId === categoryId && m.SectionId === section_id);
    setfilteredMenu(filteredmenu);
  }

  function handleAddToCart(dish: any) {
    const existingDish = Cart.find((item: any) => item.id === dish.id);
    if (existingDish) {
      setCart(
        Cart.map((item: any) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...Cart, { ...dish, quantity: 1 }]);
    }
  }

  function handleCartItemDelete(id: any) {
    setCart(Cart.filter((item: any) => item.id !== id));
    if (Cart.length === 0) {
      setModalVisible(false);
    }
  };

  function handleIncrement(id: any) {
    setCart(
      Cart.map((item: any) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  function handleDecrement(id: any) {
    setCart(
      Cart.map((item: any) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      ).filter((item: any) => item.quantity > 0)
    );
    if (Cart.length === 0) {
      setModalVisible(false);
    }
  };

  const handleSaveMenu = async () => {
    try {
      const OrderData = Cart.map((item) => ({
        quantity: `${item.quantity}`,
        menu_id: item.id,
        hotel_id: item.Section.HotelId,
      }));

      let response;
      if (Type == "Dine-In") {
        response = await fetch(`${ApiHost}/api/hotel/orders/management/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: 'Dine-In',
            table_id: table_id,
            hotel_id: `${await getHotel_id()}`,
            waiter_id: WaiterId,
            menu_data: OrderData,
            customer_name: CustomerName,
            contact: CustomerContact,
            email: CustomerEmail,
            occassion: CustomerOccassion,
            date: CustomerDate,
          }),
        });
      } else {
        response = await fetch(`${ApiHost}/api/hotel/orders/management/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: Type,
            table_id: "",
            hotel_id: HotelId,
            waiter_id: WaiterId,
            menu_data: OrderData,
            customer_name: CustomerName,
            contact: CustomerContact,
            email: CustomerEmail,
            occassion: CustomerOccassion,
            date: CustomerDate,
          }),
        });
      }

      if (response.status === 200) {
        setIsOrderSaved(true);
        setTimeout(() => {
          setIsOrderSaved(false);
        }, 2000);
      } else {
        console.log("Order Failed");
        setIsOrderFailed(true);
        fetch_bill();
        setTimeout(() => {
          setIsOrderFailed(false);
        }, 2000);
      }
    } catch (e) {
      throw console.error(e);
    }
  };

  const handleKotPrint = useReactToPrint({
    // content: () => billkot.current,
    contentRef: billkot.current,
  });

  async function LoadUserData() {
    try {

      const tableinfo: any = await getTableInfo();
      const info = JSON.parse(tableinfo);
      const secid: string = info[0]?.sectionid;
      const tblid: string = info[0]?.id;
      const tablename = info[0]?.name;
      setsection_id(secid);
      settable_id(tblid);
      settableName(tablename);

    } catch (e: any) {
      throw console.error(e);
    }
  }

  useEffect(() => {
    LoadUserData();
    fetchMenuandCategory();
  }, [])

  return (
    <>
      <View style={{ backgroundColor: '#fff', width: width, height: height }}>
        {/* Search bar for dishes */}
        <TextInput
          style={styles.searchBar}
          placeholder='Search Dishes...'
          value={dishSearchQuery}
          onChangeText={setDishSearchQuery}
        />

        {/* Dropdown to filter dishes by category */}
        <View style={styles.pickerContainer}>
          <Text style={styles.filterLabel}>Filter by Category:</Text>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => { setSelectedCategory(itemValue); handleFilterByCategory(itemValue); }}
          >
            <Picker.Item label={'All'} value={'All'} />
            {
              categorys.map((cate: any, index: any) => (
                <Picker.Item key={index} label={cate?.CategoryName} value={cate?.id} />
              ))
            }
          </Picker>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingVertical: 25,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {
            isLoaded ? (
              <View
                style={{ width: width - 35, justifyContent: 'center', alignItems: 'center' }}
              >
                <ActivityIndicator size={50} color={'#f53a3a'} />
              </View>
            ) : (
              <View
                style={{
                  // marginTop: 20,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                {
                  selectedCategory === 'All' ? (
                    Menus?.filter((m: any) => m.SectionId === section_id && m.Dish.DishName.toLowerCase().includes(dishSearchQuery.toLowerCase())).map((menu: any, index: any) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.Tables,
                          { borderColor: menu?.Dish.Type === 'Veg' ? 'green' : (menu?.Dish.Type === 'Non-Veg' ? 'red' : (menu?.Dish.Type === 'Egg' ? 'yellow' : (menu?.Dish.Type === 'Beverages' ? 'blue' : ''))), borderWidth: 2 },
                        ]}
                        onPress={() => { handleAddToCart(menu) }} // Add dish on press
                      >
                        <Text style={{ fontSize: 15, textAlign: 'center' }}>{menu?.Dish.DishName}</Text>
                        <Text style={{ fontSize: 15, textAlign: 'center' }}>Price: ₹{menu.Price}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    filteredMenu?.filter((m: any) => m.Dish.DishName.toLowerCase().includes(dishSearchQuery.toLowerCase())).map((menu: any, index: any) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.Tables,
                          { borderColor: menu?.Dish.Type === 'Veg' ? 'green' : (menu?.Dish.Type === 'Non-Veg' ? 'red' : (menu?.Dish.Type === 'Egg' ? 'yellow' : (menu?.Dish.Type === 'Beverages' ? 'blue' : ''))), borderWidth: 2 },
                        ]}
                        onPress={() => { handleAddToCart(menu) }} // Add dish on press
                      >
                        <Text style={{ fontSize: 15, textAlign: 'center' }}>{menu?.Dish.DishName}</Text>
                        <Text style={{ fontSize: 15, textAlign: 'center' }}>Price: ₹{menu.Price}</Text>
                      </TouchableOpacity>
                    ))
                  )
                }
              </View>
            )
          }
        </ScrollView >

        {/* Button to view order summary */}
        <View style={{ paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', gap: 20, }}>
          <TouchableOpacity style={styles.orderButton} onPress={() => setModalVisible(true)}>
            <Text style={{ color: '#FFF', textAlign: 'center' }}>View Order Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 10,
              position: 'relative',
            }}
          >
            <FontAwesome5 name="shopping-cart" size={30} color="#fa1f1f" />
            <Text
              style={{ position: 'absolute', top: -2, right: -2, fontSize: 20, fontWeight: 'bold', color: '#fa1f1f' }}
            >{Cart.length}</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Order Summary */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          style={{
            flex: 1,
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Order Summary</Text>
              <ScrollView
                contentContainerStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 5,
                }}
              >
                {Cart.length > 0 ? (
                  Cart.map((dish: any, index: any) => (
                    <View key={index} style={styles.dishRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => { handleCartItemDelete(dish.id) }}
                        >
                          <MaterialIcons
                            name="delete"
                            size={35}
                            color="#fa1f1f"
                          />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingLeft: 10, }}>
                          <TouchableOpacity
                            onPress={() => { handleIncrement(dish.id) }}
                          >
                            <Entypo
                              name="circle-with-plus"
                              size={30}
                              color="#fa1f1f"
                            />
                          </TouchableOpacity>
                          <Text style={{ paddingHorizontal: 6, paddingVertical: 'auto', fontSize: 18, fontWeight: 'bold', }}>{dish.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => { handleDecrement(dish.id) }}
                          >
                            <Entypo
                              name="circle-with-minus"
                              size={30}
                              color="#fa1f1f"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: 25,
                        }}
                      >
                        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{dish.Dish.DishName}</Text>
                        <Text style={{ fontSize: 18 }}>₹{dish.Price}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text>No dishes selected.</Text>
                )}
              </ScrollView>
              <View
                style={{
                  width: width,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  marginVertical: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    width: '95%',
                    padding: 15,
                    backgroundColor: '#fa1f1f',
                    borderRadius: 10,
                  }}
                // onPress={handleKotPrint}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Kot & Print</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: '95%',
                    padding: 15,
                    backgroundColor: '#fa1f1f',
                    borderRadius: 10,
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View >
      <View style={styles.Bill}>
        <Text>{tableName}</Text>
        <View
          style={{ paddingVertical: 10, }}
        >
          {
            Cart.map((menu: any, index: any) => (
              <View
                key={index}
                style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4, }}
              >
                <Text>{menu.Dish.DishName}</Text>
                <Text>{menu.quantity}</Text>
              </View>
            ))
          }
        </View>
      </View>
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
    borderRadius: 8,
    marginLeft: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.80,
    shadowRadius: 4.65,
    elevation: 10,
  },

  pickerContainer: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },

  filterLabel: {
    fontSize: 16,
    color: '#333'
  },

  picker: {
    height: 50,
    width: '100%',
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
  },

  TablesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },

  Tables: {
    backgroundColor: '#f4f4f4',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    flexBasis: '48%',
    marginBottom: 15,
    alignItems: 'center',
    elevation: 10,
  },

  selected: {
    backgroundColor: '#e0ffe0', // Highlight selected dishes
  },

  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#ff5353',
  },

  orderButton: {
    flex: 1,
    backgroundColor: '#fa1f1f',
    borderRadius: 10,
    padding: 15,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: 0,
  },

  modalContent: {
    width: width,
    height: height - 20,
    marginHorizontal: 'auto',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  dishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
    backgroundColor: '#fff',
    padding: 5,
    elevation: 3,
    borderRadius: 8,
  },

  Bill: {
    width: 200,
    height: 'auto',
    backgroundColor: '#fff',
    padding: 20,
    position: 'absolute',
    zIndex: -40,
  },
});



{/* Display filtered dishes */ }
// <View style={{ marginTop: 20 }}>
//   <View style={styles.TablesRow}>
//     <TouchableOpacity
//       style={[
//         styles.Tables,
//         { borderColor: dish.type === 'Veg' ? 'green' : 'red' },
//         selectedDishes.some(selectedDish => selectedDish.name === dish.name) ? styles.selected : {}
//       ]}
//       onPress={() => addDish(dish)} // Add dish on press
//     >
//       <Text style={{ textAlign: 'center' }}>{dish.name}</Text>
//       <Text style={{ textAlign: 'center' }}>Price: ₹{dish.price}</Text>
//     </TouchableOpacity>
//       ))}
//   </View>
// </View>
//
