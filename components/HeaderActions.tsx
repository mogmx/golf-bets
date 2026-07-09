import { useRouter } from 'expo-router';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../lib/colors';

export function HeaderActions() {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => {
          Keyboard.dismiss();
          router.replace('/');
        }}
        style={styles.button}
      >
        <Text style={styles.text}>Listo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.button}>
        <Text style={styles.text}>Inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, marginRight: 8 },
  button: { paddingVertical: 4, paddingHorizontal: 2 },
  text: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
