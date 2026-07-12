import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../lib/colors';
import { confirmDelete } from '../../lib/confirm';
import { currentStrokes, friendLifetimeTotal } from '../../lib/scoring';
import { useStore } from '../../lib/store';

export default function FriendsScreen() {
  const router = useRouter();
  const friends = useStore((s) => s.friends);
  const entries = useStore((s) => s.entries);
  const addFriend = useStore((s) => s.addFriend);
  const deleteFriend = useStore((s) => s.deleteFriend);

  const [newName, setNewName] = useState('');

  const friendRows = useMemo(
    () =>
      [...friends]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((f) => ({
          friend: f,
          total: friendLifetimeTotal(entries, f.id),
          strokes: currentStrokes(entries, f.id, f.defaultStrokes ?? 0),
        })),
    [friends, entries]
  );

  const grandTotal = useMemo(() => friendRows.reduce((sum, r) => sum + r.total, 0), [friendRows]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const friend = addFriend(name);
    setNewName('');
    router.push(`/friend/${friend.id}`);
  };

  const handleDelete = (id: string, name: string) => {
    confirmDelete('Eliminar amigo', `¿Eliminar a ${name} y todo su historial?`, () => deleteFriend(id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del amigo"
          placeholderTextColor={colors.textMuted}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={friendRows}
        keyExtractor={(item) => item.friend.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay amigos todavía. Agrega uno arriba.</Text>}
        renderItem={({ item }) => {
          const positive = item.total >= 0;
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/friend/${item.friend.id}`)}
              onLongPress={() => handleDelete(item.friend.id, item.friend.name)}
            >
              <View>
                <Text style={styles.rowName}>{item.friend.name}</Text>
                <Text style={styles.rowStrokes}>
                  Strokes: {item.strokes >= 0 ? '+' : ''}
                  {item.strokes}
                </Text>
              </View>
              <Text style={[styles.rowTotal, { color: positive ? colors.positive : colors.negative }]}>
                {positive ? '+' : ''}
                {item.total.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          friendRows.length > 0 ? (
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Total</Text>
              <Text
                style={[styles.footerTotal, { color: grandTotal >= 0 ? colors.positive : colors.negative }]}
              >
                {grandTotal >= 0 ? '+' : ''}
                {grandTotal.toFixed(2)}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  addButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600' },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
  },
  rowName: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowStrokes: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowTotal: { fontSize: 18, fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 32 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  footerTotal: { fontSize: 20, fontWeight: '800' },
});
