import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../lib/colors';

export function DatePickerField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  return (
    <View>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: 4 }}>Fecha</Text>
      {React.createElement('input', {
        type: 'date',
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.value) onChange(e.target.value);
        },
        style: {
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '10px 12px',
          color: colors.text,
          fontSize: '16px',
          fontFamily: 'inherit',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '8px',
        },
      })}
    </View>
  );
}
