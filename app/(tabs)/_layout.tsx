import { Tabs } from 'expo-router';
import { colors } from '../../lib/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Amigos' }} />
      <Tabs.Screen name="equipos" options={{ title: 'Equipos' }} />
    </Tabs>
  );
}
