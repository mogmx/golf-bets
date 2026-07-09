import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../lib/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="friend/[id]" options={{ title: 'Amigo' }} />
        <Stack.Screen name="entry/[id]" options={{ title: 'Entrada' }} />
        <Stack.Screen name="team/[id]" options={{ title: 'Equipo' }} />
        <Stack.Screen name="teamEntry/[id]" options={{ title: 'Entrada' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
