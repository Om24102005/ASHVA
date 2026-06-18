/** ASHVA — React Native (Expo / Metro) app root.
 *  Loads brand fonts → auth gate → contact gatekeeper → bottom tabs + the full
 *  booking funnel stack. Screens are presentational; adapters wire props to nav. */
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
import { useFonts, InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { GearScreen } from './src/screens/GearScreen';
import { KYCScreen } from './src/screens/KYCScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { PassScreen } from './src/screens/PassScreen';
import { TripScreen } from './src/screens/TripScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { RoutesScreen } from './src/screens/RoutesScreen';
import { RouteScreen } from './src/screens/RouteScreen';
import { GarageScreen } from './src/screens/GarageScreen';
import { GsubScreen } from './src/screens/GsubScreen';
import { GatekeeperScreen } from './src/screens/GatekeeperScreen';
import { API, gateStep } from './src/api';
import { C } from './src/theme';
import { rs } from './src/responsive';

const Stack = createNativeStackNavigator<any>();
const Tab = createBottomTabNavigator<any>();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: C.base, card: C.surf, primary: C.ember, text: C.ink, border: C.line },
};
const TAB_ICON: Record<string, keyof typeof Ionicons.glyphMap> = { Home: 'flame', Routes: 'map', Bookings: 'receipt', Garage: 'person' };

function Boot() {
  return <View style={styles.boot}><ActivityIndicator color={C.ember} size="large" /></View>;
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [gateSkipped, setGateSkipped] = useState(false);

  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold, JetBrainsMono_400Regular,
  });

  useEffect(() => {
    (async () => { setSession(await API.getSession()); setBooting(false); })();
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
        <Tab.Screen name="Home">{({ navigation }: any) => <HomeScreen onSelect={(b) => navigation.navigate('Detail', { bike: b })} onOpenRoute={(r) => navigation.navigate('Route', { route: r })} />}</Tab.Screen>
        <Tab.Screen name="Routes">{({ navigation }: any) => <RoutesScreen onOpen={(r) => navigation.navigate('Route', { route: r })} />}</Tab.Screen>
        <Tab.Screen name="Bookings">{({ navigation }: any) => <BookingsScreen onOpenTrip={(bk) => navigation.navigate('Trip', { booking: bk })} />}</Tab.Screen>
        <Tab.Screen name="Garage">
          {({ navigation }: any) => (
            <GarageScreen
              session={session}
              onSignOut={async () => { await API.setSession(null); setSession(null); setGateSkipped(false); }}
              onOpenKyc={() => navigation.navigate('KYC')}
              onOpenMembership={() => navigation.navigate('Gsub')}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  if (booting || !fontsLoaded) return <Boot />;

  // Not signed in → auth.
  if (!session) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider><StatusBar style="light" /><AuthScreen onAuthed={setSession} /></SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  // Signed in but a contact channel still needs verifying → gatekeeper.
  const gate = gateStep(session.user);
  if (gate && !gateSkipped) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <GatekeeperScreen
            session={session}
            channel={gate}
            onVerified={async () => { const r = await API.me(); if (r.ok) { const s = { ...session, user: (r.data as any).user }; await API.setSession(s); setSession(s); } else setGateSkipped(true); }}
            onSkip={() => setGateSkipped(true)}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.base } }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Detail">
              {({ navigation, route }: any) => <DetailScreen bike={route.params.bike} onBack={() => navigation.goBack()} onBook={() => navigation.navigate('Booking', { bike: route.params.bike })} />}
            </Stack.Screen>
            <Stack.Screen name="Booking">
              {({ navigation, route }: any) => <BookingScreen bike={route.params.bike} onBack={() => navigation.goBack()} onContinue={(cfg) => navigation.navigate('Gear', { bike: route.params.bike, ...cfg })} />}
            </Stack.Screen>
            <Stack.Screen name="Gear">
              {({ navigation, route }: any) => <GearScreen days={route.params.days} onBack={() => navigation.goBack()} onContinue={(gear) => navigation.navigate('KYC', { ...route.params, gear })} />}
            </Stack.Screen>
            <Stack.Screen name="KYC">
              {({ navigation, route }: any) => <KYCScreen onBack={() => navigation.goBack()} onDone={() => (route.params ? navigation.navigate('Payment', route.params) : navigation.goBack())} />}
            </Stack.Screen>
            <Stack.Screen name="Payment">
              {({ navigation, route }: any) => {
                const { bike, days, hub, gear = [] } = route.params || {};
                const gearPerDay = gear.reduce((s: number, g: any) => s + g.pricePerDay, 0);
                const amount = (bike.price + 199 + gearPerDay) * days + 299;
                return <PaymentScreen amount={amount} deposit={15000} onBack={() => navigation.goBack()} onPaid={() => navigation.replace('Pass', { bike, hub })} />;
              }}
            </Stack.Screen>
            <Stack.Screen name="Pass">
              {({ navigation, route }: any) => <PassScreen bike={route.params?.bike} hub={route.params?.hub} onStartTrip={() => navigation.replace('Trip', { bike: route.params?.bike })} onHome={() => navigation.popToTop()} />}
            </Stack.Screen>
            <Stack.Screen name="Trip">
              {({ navigation, route }: any) => <TripScreen bike={route.params?.bike} onBack={() => navigation.popToTop()} />}
            </Stack.Screen>
            <Stack.Screen name="Route">
              {({ navigation, route }: any) => <RouteScreen route={route.params.route} onBack={() => navigation.goBack()} onPickBike={(bike) => navigation.navigate('Detail', { bike })} />}
            </Stack.Screen>
            <Stack.Screen name="Gsub">
              {({ navigation }: any) => <GsubScreen onBack={() => navigation.goBack()} onSubscribe={() => navigation.goBack()} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: C.base, alignItems: 'center', justifyContent: 'center' },
});
