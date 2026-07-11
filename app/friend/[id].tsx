import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BalanceChart } from '../../components/BalanceChart';
import { HeaderActions } from '../../components/HeaderActions';
import { colors } from '../../lib/colors';
import { confirmDelete } from '../../lib/confirm';
import { formatDate, todayISO } from '../../lib/date';
import { entryTotal, friendLifetimeTotal, nextStrokes, teamLifetimeTotal } from '../../lib/scoring';
import { computeStats } from '../../lib/stats';
import { useStore } from '../../lib/store';

function formatSigned(n: number): string {
  return (n >= 0 ? '+' : '') + n;
}

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const friend = useStore((s) => s.friends.find((f) => f.id === id));
  const allEntries = useStore((s) => s.entries);
  const friends = useStore((s) => s.friends);
  const teams = useStore((s) => s.teams);
  const teamEntries = useStore((s) => s.teamEntries);
  const updateFriend = useStore((s) => s.updateFriend);
  const deleteFriend = useStore((s) => s.deleteFriend);
  const addEntry = useStore((s) => s.addEntry);
  const deleteEntry = useStore((s) => s.deleteEntry);

  const entries = useMemo(
    () => allEntries.filter((e) => e.friendId === id).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [allEntries, id]
  );

  const relatedTeams = useMemo(
    () => teams.filter((t) => t.opponent1Id === id || t.opponent2Id === id),
    [teams, id]
  );

  const stats = useMemo(() => computeStats(entries), [entries]);

  const [hcp, setHcp] = useState(friend?.hcp ?? '');
  const [defaultStrokesText, setDefaultStrokesText] = useState(formatSigned(friend?.defaultStrokes ?? 0));
  const [montoApuesta, setMontoApuesta] = useState(friend?.montoApuesta ?? '');
  const [montoMarcas, setMontoMarcas] = useState(friend?.montoMarcas ?? '');
  const [montoMedal, setMontoMedal] = useState(friend?.montoMedal ?? '');
  const [notas, setNotas] = useState(friend?.notas ?? '');

  if (!friend) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Amigo no encontrado.</Text>
      </View>
    );
  }

  const total = friendLifetimeTotal(allEntries, friend.id);
  const positive = total >= 0;

  const handleAddEntry = () => {
    const lastEntry = entries[0];
    const initialStrokes = lastEntry ? nextStrokes(lastEntry) : friend.defaultStrokes ?? 0;
    const entry = addEntry(friend.id, todayISO(), initialStrokes);
    router.push(`/entry/${entry.id}`);
  };

  const handleDeleteFriend = () => {
    confirmDelete('Eliminar amigo', `Esto eliminará a ${friend.name} y todo su historial.`, () => {
      deleteFriend(friend.id);
      router.back();
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerRight: () => <HeaderActions /> }} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={[styles.total, { color: positive ? colors.positive : colors.negative }]}>
          {positive ? '+' : ''}
          {total.toFixed(2)}
        </Text>

        <Text style={styles.label}>HCP</Text>
        <TextInput
          style={styles.input}
          placeholder="12.4"
          placeholderTextColor={colors.textMuted}
          value={hcp}
          onChangeText={(t) => {
            setHcp(t);
            updateFriend(friend.id, { hcp: t });
          }}
        />

        <Text style={styles.label}>Strokes (inicial)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numbers-and-punctuation"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={defaultStrokesText}
          onChangeText={(t) => {
            setDefaultStrokesText(t);
            const n = parseFloat(t);
            updateFriend(friend.id, { defaultStrokes: Number.isFinite(n) ? n : 0 });
          }}
          onBlur={() => setDefaultStrokesText(formatSigned(friend.defaultStrokes ?? 0))}
        />
        <Text style={styles.hint}>Positivo = recibes strokes. Negativo = das strokes.</Text>

        <Text style={styles.label}>Monto Apuesta</Text>
        <TextInput
          style={styles.input}
          placeholder="$50 $50 $100"
          placeholderTextColor={colors.textMuted}
          value={montoApuesta}
          onChangeText={(t) => {
            setMontoApuesta(t);
            updateFriend(friend.id, { montoApuesta: t });
          }}
        />

        <Text style={styles.label}>Monto Marcas</Text>
        <TextInput
          style={styles.input}
          placeholder="$25"
          placeholderTextColor={colors.textMuted}
          value={montoMarcas}
          onChangeText={(t) => {
            setMontoMarcas(t);
            updateFriend(friend.id, { montoMarcas: t });
          }}
        />

        <Text style={styles.label}>Monto Medal</Text>
        <TextInput
          style={styles.input}
          placeholder="$10"
          placeholderTextColor={colors.textMuted}
          value={montoMedal}
          onChangeText={(t) => {
            setMontoMedal(t);
            updateFriend(friend.id, { montoMedal: t });
          }}
        />

        <Text style={styles.label}>Notas</Text>
        <TextInput
          style={styles.input}
          placeholder="Carry no se ajusta"
          placeholderTextColor={colors.textMuted}
          value={notas}
          onChangeText={(t) => {
            setNotas(t);
            updateFriend(friend.id, { notas: t });
          }}
        />

        {relatedTeams.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Equipos</Text>
            {relatedTeams.map((t) => {
              const otherId = t.opponent1Id === id ? t.opponent2Id : t.opponent1Id;
              const other = friends.find((f) => f.id === otherId);
              const teamTotal = teamLifetimeTotal(teamEntries, t.id);
              const teamPositive = teamTotal >= 0;
              return (
                <TouchableOpacity key={t.id} style={styles.teamLinkRow} onPress={() => router.push(`/team/${t.id}`)}>
                  <Text style={styles.teamLinkName}>
                    Tú y {t.partnerName} vs {friend.name} & {other?.name ?? '?'}
                  </Text>
                  <Text style={[styles.teamLinkTotal, { color: teamPositive ? colors.positive : colors.negative }]}>
                    {teamPositive ? '+' : ''}
                    {teamTotal.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.roundsPlayed}</Text>
            <Text style={styles.statLabel}>Rondas jugadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {stats.matchWins}-{stats.matchLosses}
            </Text>
            <Text style={styles.statLabel}>Match (G-P)</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {stats.marcasWins}-{stats.marcasLosses}
            </Text>
            <Text style={styles.statLabel}>Marcas (G-P)</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: stats.marcasBalance >= 0 ? colors.positive : colors.negative }]}>
              {stats.marcasBalance >= 0 ? '+' : ''}
              {stats.marcasBalance.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Marcas $</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: stats.medalBalance >= 0 ? colors.positive : colors.negative }]}>
              {stats.medalBalance >= 0 ? '+' : ''}
              {stats.medalBalance.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Medal $</Text>
          </View>
        </View>
        <Text style={styles.label}>Balance</Text>
        <BalanceChart points={stats.balancePoints} />

        <Text style={styles.sectionTitle}>Historial</Text>
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.empty}>No hay entradas todavía.</Text>}
          renderItem={({ item }) => {
            const t = entryTotal(item);
            const pos = t >= 0;
            return (
              <TouchableOpacity
                style={styles.entryCard}
                onPress={() => router.push(`/entry/${item.id}`)}
                onLongPress={() =>
                  confirmDelete('Eliminar entrada', `¿Eliminar la entrada del ${formatDate(item.fecha)}?`, () =>
                    deleteEntry(item.id)
                  )
                }
              >
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryDate}>{formatDate(item.fecha)}</Text>
                  <Text style={[styles.entryTotal, { color: pos ? colors.positive : colors.negative }]}>
                    {pos ? '+' : ''}
                    {t.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.entryDetailsRow}>
                  <Text style={styles.entryDetail}>
                    Strokes: {item.strokes >= 0 ? '+' : ''}
                    {item.strokes}
                  </Text>
                  <Text style={styles.entryDetail}>Ganado: ${item.ganado.toFixed(2)}</Text>
                  <Text style={styles.entryDetail}>Perdido: ${item.perdido.toFixed(2)}</Text>
                  <Text style={styles.entryDetail}>
                    Marcas: {item.marcasGanado - item.marcasPerdido >= 0 ? '+' : ''}
                    {(item.marcasGanado - item.marcasPerdido).toFixed(2)}
                  </Text>
                  <Text style={styles.entryDetail}>
                    Medal: {item.medalGanado - item.medalPerdido >= 0 ? '+' : ''}
                    {(item.medalGanado - item.medalPerdido).toFixed(2)}
                  </Text>
                  <Text style={styles.entryDetail}>Carry: {item.carry ? 'SI' : 'NO'}</Text>
                  {item.carry && (
                    <Text style={styles.entryDetail}>Carry Ajusta: {item.carryAjusta ? 'SI' : 'NO'}</Text>
                  )}
                  <Text style={styles.entryDetail}>Match: {item.match ? 'SI' : 'NO'}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity style={styles.newButton} onPress={handleAddEntry}>
          <Text style={styles.newButtonText}>+ Nueva Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFriend}>
          <Text style={styles.deleteText}>Eliminar Amigo</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  empty: { textAlign: 'center', color: colors.textMuted, marginVertical: 12 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  total: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: 4 },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  teamLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  teamLinkName: { fontSize: 13, color: colors.text, flex: 1, marginRight: 8 },
  teamLinkTotal: { fontSize: 14, fontWeight: '700' },
  entryCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  entryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDate: { fontSize: 15, fontWeight: '700', color: colors.text },
  entryTotal: { fontSize: 16, fontWeight: '800' },
  entryDetailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  entryDetail: { fontSize: 12, color: colors.textMuted },
  newButton: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  newButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  deleteButton: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  deleteText: { color: colors.danger, fontWeight: '600' },
});
