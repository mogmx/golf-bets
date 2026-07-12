import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../lib/colors';
import { confirmDelete, showAlert } from '../../lib/confirm';
import { currentTeamStrokes, teamLifetimeTotal } from '../../lib/scoring';
import { useStore } from '../../lib/store';

export default function EquiposScreen() {
  const router = useRouter();
  const teams = useStore((s) => s.teams);
  const teamEntries = useStore((s) => s.teamEntries);
  const friends = useStore((s) => s.friends);
  const addFriend = useStore((s) => s.addFriend);
  const addTeam = useStore((s) => s.addTeam);
  const deleteTeam = useStore((s) => s.deleteTeam);

  const [modalVisible, setModalVisible] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [opponent1Id, setOpponent1Id] = useState<string | null>(null);
  const [opponent2Id, setOpponent2Id] = useState<string | null>(null);
  const [newFriendName, setNewFriendName] = useState('');

  const teamRows = useMemo(
    () =>
      teams.map((t) => ({
        team: t,
        opponent1: friends.find((f) => f.id === t.opponent1Id),
        opponent2: friends.find((f) => f.id === t.opponent2Id),
        total: teamLifetimeTotal(teamEntries, t.id),
        strokes: currentTeamStrokes(teamEntries, t.id, t.defaultStrokes ?? 0),
      })),
    [teams, friends, teamEntries]
  );

  const grandTotal = useMemo(() => teamRows.reduce((sum, r) => sum + r.total, 0), [teamRows]);

  const openModal = () => {
    setPartnerName('');
    setOpponent1Id(null);
    setOpponent2Id(null);
    setNewFriendName('');
    setModalVisible(true);
  };

  const handleAddNewFriend = () => {
    const name = newFriendName.trim();
    if (!name) return;
    const friend = addFriend(name);
    if (!opponent1Id) setOpponent1Id(friend.id);
    else if (!opponent2Id) setOpponent2Id(friend.id);
    setNewFriendName('');
  };

  const toggleOpponent = (id: string) => {
    if (opponent1Id === id) {
      setOpponent1Id(null);
    } else if (opponent2Id === id) {
      setOpponent2Id(null);
    } else if (!opponent1Id) {
      setOpponent1Id(id);
    } else if (!opponent2Id) {
      setOpponent2Id(id);
    }
  };

  const handleCreate = () => {
    if (!partnerName.trim() || !opponent1Id || !opponent2Id) {
      showAlert('Faltan datos', 'Ingresa tu pareja y selecciona 2 oponentes.');
      return;
    }
    const team = addTeam(partnerName.trim(), opponent1Id, opponent2Id);
    setModalVisible(false);
    router.push(`/team/${team.id}`);
  };

  const handleDelete = (id: string) => {
    confirmDelete('Eliminar equipo', '¿Eliminar este equipo y todo su historial?', () => deleteTeam(id));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={teamRows}
        keyExtractor={(item) => item.team.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay equipos todavía. Agrega uno abajo.</Text>}
        renderItem={({ item }) => {
          const positive = item.total >= 0;
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/team/${item.team.id}`)}
              onLongPress={() => handleDelete(item.team.id)}
            >
              <View>
                <Text style={styles.rowName}>
                  vs {item.opponent1?.name ?? '?'} & {item.opponent2?.name ?? '?'}
                </Text>
                <Text style={styles.rowSub}>Tu pareja: {item.team.partnerName}</Text>
                <Text style={styles.rowSub}>
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
          teamRows.length > 0 ? (
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

      <TouchableOpacity style={styles.newButton} onPress={openModal}>
        <Text style={styles.newButtonText}>+ Nuevo Equipo</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo Equipo</Text>

            <Text style={styles.label}>Tu pareja</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de tu pareja"
              placeholderTextColor={colors.textMuted}
              value={partnerName}
              onChangeText={setPartnerName}
            />

            <Text style={styles.label}>Oponentes (elige 2)</Text>
            <View style={styles.friendPicker}>
              {friends.length === 0 && <Text style={styles.empty}>Agrega amigos abajo para elegirlos.</Text>}
              {friends.map((f) => {
                const selected = opponent1Id === f.id || opponent2Id === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.friendChip, selected && styles.friendChipSelected]}
                    onPress={() => toggleOpponent(f.id)}
                  >
                    <Text style={selected ? styles.friendChipTextSelected : styles.friendChipText}>{f.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Nuevo amigo</Text>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Nombre"
                placeholderTextColor={colors.textMuted}
                value={newFriendName}
                onChangeText={setNewFriendName}
                onSubmitEditing={handleAddNewFriend}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addFriendButton} onPress={handleAddNewFriend}>
                <Text style={styles.addFriendButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  list: { gap: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, marginVertical: 12 },
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
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowTotal: { fontSize: 18, fontWeight: '800' },
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
  newButton: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  newButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: 4 },
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
  addRow: { flexDirection: 'row', gap: 8 },
  addFriendButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  addFriendButtonText: { color: '#fff', fontWeight: '600' },
  friendPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  friendChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  friendChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  friendChipText: { color: colors.text },
  friendChipTextSelected: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 12 },
  cancelButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: colors.background },
  cancelText: { color: colors.text, fontWeight: '600' },
  createButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: colors.primary },
  createText: { color: '#fff', fontWeight: '700' },
});
