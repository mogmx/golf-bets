import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../lib/colors';
import { formatDate } from '../lib/date';

export function DatePickerField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [y, m, d] = value.split('-').map(Number);
  const dateObj = new Date(y, (m ?? 1) - 1, d ?? 1);

  return (
    <View>
      <Text style={styles.label}>Fecha</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={{ color: colors.text }}>{formatDate(value)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <>
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event, selected) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (selected) onChange(selected.toISOString().slice(0, 10));
            }}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowPicker(false)}>
              <Text style={styles.doneButtonText}>Listo</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  doneButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16, marginBottom: 8 },
  doneButtonText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
