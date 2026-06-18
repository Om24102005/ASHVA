/** ASHVA — React Native (Expo / Metro) app root.
 *  Auth gate → bottom tabs (Home / Routes / Bookings / Garage) with a stack
 *  for the booking funnel (Detail → Booking → Gear → Payment → Trip).
 *  Screens are presentational; thin adapters here wire their props to navigation. */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { GearScreen } from './src/screens/GearScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { TripScreen } from './src/screens/TripScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { RoutesScreen } from './src/screens/RoutesScreen';
import { GarageScreen } from './src/screens/GarageScreen';
import { API } from './src/api';
import { C } from './src/theme';
import { rs } from './src/responsive';

const Stack = createNativeStackNavigator<any>();
const Tab = createBottomTabNavigator<any>();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: C.base, card: C.surf, primary: C.ember, text: C.ink, border: C.line },
};

const TAB_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'flame', Routes: 'map', Bookings: 'receipt', Garage: 'person',
};

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      setSession(await API.getSession());
      setBooting(false);
    })();
  }, []);

  function Tabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: C.ember,
          tabBarInactiveTintColor: C.faint,
          tabBarStyle: { backgroundColor: C.surf, borderTopColor: C.line, height: rs(64), paddingBottom: rs(8), paddingTop: rs(6) },
          tabBarLabelStyle: { fontSize: rs(10), fontWeight: '600' },
          tabBarIcon: ({ color, size }) => <Ionicons name={TAB_ICON[route.name]} size={size} color={color} />,
        })}
      >
        <Tab.Screen name="Home">
          {({ navigation }: any) => <HomeScreen onSelect={(b) => navigation.navigate('Detail', { bike: b })} />}
        </Tab.Screen>
        <Tab.Screen name="Routes">
          {() => <RoutesScreen onOpen={() => { /* RouteDetail screen: next port */ }} />}
        </Tab.Screen>
        <Tab.Screen name="Bookings">
          {({ navigation }: any) => <BookingsScreen onOpenTrip={(bk) => navigation.navigate('Trip', { booking: bk })} />}
        </Tab.Screen>
        <Tab.Screen name="Garage">
          {() => <GarageScreen session={session} onSignOut={async () => { await API.setSession(null); setSession(null); }} />}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  if (booting) {
    return (
      <View style={styles.boot}><ActivityIndicator color={C.ember} size="large" /></View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {!session ? (
          <AuthScreen onAuthed={setSession} />
        ) : (
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.base } }}>
              <Stack.Screen name="Tabs" component={Tabs} />
              <Stack.Screen name="Detail">
                {({ navigation, route }: any) => (
                  <DetailScreen bike={route.params.bike} onBack={() => navigation.goBack()} onBook={() => navigation.navigate('Booking', { bike: route.params.bike })} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Booking">
                {({ navigation, route }: any) => (
                  <BookingScreen bike={route.params.bike} onBack={() => navigation.goBack()} onContinue={(cfg) => navigation.navigate('Gear', { bike: route.params.bike, ...cfg })} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Gear">
                {({ navigation, route }: any) => (
                  <GearScreen days={route.params.days} onBack={() => navigation.goBack()} onContinue={(gear) => navigation.navigate('Payment', { ...route.params, gear })} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Payment">
                {({ navigation, route }: any) => {
                  const { bike, days, gear = [] } = route.params;
                  const gearPerDay = gear.reduce((s: number, g: any) => s + g.pricePerDay, 0);
                  const amount = (bike.price + 199 + gearPerDay) * days + 299;
                  return (
                    <PaymentScreen
                      amount={amount}
                      deposit={15000}
                      onBack={() => navigation.goBack()}
                      onPaid={() => navigation.replace('Trip', { bike })}
                    />
                  );
                }}
              </Stack.Screen>
              <Stack.Screen name="Trip">
                {({ navigation, route }: any) => (
                  <TripScreen bike={route.params?.bike} onBack={() => navigation.popToTop()} />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: C.base, alignItems: 'center', justifyContent: 'center' },
});
