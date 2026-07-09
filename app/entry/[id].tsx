import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { DatePickerField } from '../../components/DatePickerField';
import { HeaderActions } from '../../components/HeaderActions';
import { colors } from '../../lib/colors';
import { entryTotal, nextStrokes } from '../../lib/scoring';
import { useStore } from '../../lib/store';
import { Entry } from '../../lib/types';

function formatSigned(n: number): string {
  return (n >= 0 ? '+' : '') + n;
}

function NumberField({
  label,
  value,
  onChangeValue,
  signed,
}: {
  label: string;
  value: number;
  onChangeValue: (n: number) => void;
  signed?: boolean;
}) {
  const [text, setText] = useState(signed ? formatSigned(value) : String(value));
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType={signed ? 'numbers-and-punctuation' : 'decimal-pad'}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={(t) => {
          setText(t);
          const n = parseFloat(t);
          onChangeValue(Number.isFinite(n) ? n : 0);
        }}
        onBlur={() => setText(signed ? formatSigned(value) : String(value))}
      />
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <View style={styles.switchWithTag}>
        <Text style={styles.switchTag}>{value ? 'SI' : 'NO'}</Text>
        <Switch value={value} onValueChange={onChange} />
      </View>
    </View>
  );
}

export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const entry = useStore((s) => s.entries.find((e) => e.id === id));
  const friend = useStore((s) => s.friends.find((f) => f.id === entry?.friendId));
  const updateEntry = useStore((s) => s.updateEntry);

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Entrada no encontrada.</Text>
      </View>
    );
  }

  const patch = (p: Partial<Entry>) => updateEntry(entry.id, p);
  const total = entryTotal(entry);
  const positive = total >= 0;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ headerRight: () => <HeaderActions /> }} />
      <ToggleRow
        label="Carry Ajusta Strokes"
        value={!!entry.carryAjusta}
        onChange={(v) => patch({ carryAjusta: v })}
      />

      <Text style={styles.title}>vs {friend?.name ?? 'Amigo'}</Text>

      <DatePickerField value={entry.fecha} onChange={(iso) => patch({ fecha: iso })} />

      <ToggleRow label="Match" value={entry.match} onChange={(v) => patch({ match: v })} />

      <Text style={styles.sectionTitle}>Strokes</Text>
      <NumberField label="Strokes" value={entry.strokes} onChangeValue={(n) => patch({ strokes: n })} signed />
      <Text style={styles.hint}>Positivo = recibes strokes. Negativo = das strokes.</Text>

      <Text style={styles.sectionTitle}>Resultado</Text>
      <View style={styles.row2}>
        <NumberField label="Ganado ($)" value={entry.ganado} onChangeValue={(n) => patch({ ganado: n })} />
        <NumberField label="Perdido ($)" value={entry.perdido} onChangeValue={(n) => patch({ perdido: n })} />
      </View>
      <View style={{ height: 8 }} />
      <View style={styles.row2}>
        <NumberField label="Marcas ($)" value={entry.marcas} onChangeValue={(n) => patch({ marcas: n })} />
        <NumberField label="Medal ($)" value={entry.medal} onChangeValue={(n) => patch({ medal: n })} />
      </View>

      <ToggleRow label="Carry" value={entry.carry} onChange={(v) => patch({ carry: v })} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={[styles.totalValue, { color: positive ? colors.positive : colors.negative }]}>
          {positive ? '+' : ''}
          {total.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.hint}>
        {!entry.match
          ? `Match: NO — los strokes no se ajustan (siguen en ${entry.strokes >= 0 ? '+' : ''}${entry.strokes}).`
          : entry.carry && !entry.carryAjusta
          ? `Carry (sin ajustar): los strokes no se ajustan (siguen en ${entry.strokes >= 0 ? '+' : ''}${entry.strokes}).`
          : `Próxima entrada sugerida: ${nextStrokes(entry) >= 0 ? '+' : ''}${nextStrokes(entry)} strokes`}
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 32 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  row2: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    marginBottom: 8,
  },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: 4 },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  switchLabel: { fontSize: 14, color: colors.text, flex: 1, marginRight: 8 },
  switchWithTag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchTag: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 2,
    padding: 14,
    marginTop: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 20, fontWeight: '800' },
});
