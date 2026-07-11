import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BalanceChart } from '../../components/BalanceChart';
import { HeaderActions } from '../../components/HeaderActions';
import { colors } from '../../lib/colors';
import { confirmDelete } from '../../lib/confirm';
import { formatDate, todayISO } from '../../lib/date';
import { nextTeamStrokes, teamEntryTotal, teamLifetimeTotal } from '../../lib/scoring';
import { computeTeamStats } from '../../lib/stats';
import { useStore } from '../../lib/store';

function formatSigned(n: number): string {
  return (n >= 0 ? '+' : '') + n;
}

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const team = useStore((s) => s.teams.find((t) => t.id === id));
  const friends = useStore((s) => s.friends);
  const allEntries = useStore((s) => s.teamEntries);
  const updateTeam = useStore((s) => s.updateTeam);
  const deleteTeam = useStore((s) => s.deleteTeam);
  const addTeamEntry = useStore((s) => s.addTeamEntry);
  const deleteTeamEntry = useStore((s) => s.deleteTeamEntry);

  const entries = useMemo(
    () => allEntries.filter((e) => e.teamId === id).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [allEntries, id]
  );

  const stats = useMemo(() => computeTeamStats(entries), [entries]);

  const [partnerName, setPartnerName] = useState(team?.partnerName ?? '');
  const [defaultStrokesText, setDefaultStrokesText] = useState(formatSigned(team?.defaultStrokes ?? 0));
  const [montoApuesta, setMontoApuesta] = useState(team?.montoApuesta ?? '');
  const [montoMarcas, setMontoMarcas] = useState(team?.montoMarcas ?? '');
  const [montoMedal, setMontoMedal] = useState(team?.montoMedal ?? '');
  const [notas, setNotas] = useState(team?.notas ?? '');

  if (!team) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Equipo no encontrado.</Text>
      </View>
    );
  }

  const opponent1 = friends.find((f) => f.id === team.opponent1Id);
  const opponent2 = friends.find((f) => f.id === team.opponent2Id);
  const total = teamLifetimeTotal(allEntries, team.id);
  const positive = total >= 0;

  const handleAddEntry = () => {
    const lastEntry = entries[0];
    const initialStrokes = lastEntry ? nextTeamStrokes(lastEntry) : team.defaultStrokes ?? 0;
    const entry = addTeamEntry(team.id, todayISO(), initialStrokes);
    router.push(`/teamEntry/${entry.id}`);
  };

  const handleDeleteTeam = () => {
    confirmDelete('Eliminar equipo', 'Esto eliminará el equipo y todo su historial.', () => {
      deleteTeam(team.id);
      router.back();
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerRight: () => <HeaderActions /> }} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.nameRow}>
          <Text style={styles.name}>vs </Text>
          <TouchableOpacity onPress={() => opponent1 && router.push(`/friend/${opponent1.id}`)}>
            <Text style={[styles.name, styles.nameLink]}>{opponent1?.name ?? '?'}</Text>
          </TouchableOpacity>
          <Text style={styles.name}> & </Text>
          <TouchableOpacity onPress={() => opponent2 && router.push(`/friend/${opponent2.id}`)}>
            <Text style={[styles.name, styles.nameLink]}>{opponent2?.name ?? '?'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.total, { color: positive ? colors.positive : colors.negative }]}>
          {positive ? '+' : ''}
          {total.toFixed(2)}
        </Text>

        <Text style={styles.label}>Tu pareja</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de tu pareja"
          placeholderTextColor={colors.textMuted}
          value={partnerName}
          onChangeText={(t) => {
            setPartnerName(t);
            updateTeam(team.id, { partnerName: t });
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
            updateTeam(team.id, { defaultStrokes: Number.isFinite(n) ? n : 0 });
          }}
          onBlur={() => setDefaultStrokesText(formatSigned(team.defaultStrokes ?? 0))}
        />
        <Text style={styles.hint}>Positivo = tu equipo recibe strokes. Negativo = tu equipo da strokes.</Text>

        <Text style={styles.label}>Monto Apuesta</Text>
        <TextInput
          style={styles.input}
          placeholder="$50 $50 $100"
          placeholderTextColor={colors.textMuted}
          value={montoApuesta}
          onChangeText={(t) => {
            setMontoApuesta(t);
            updateTeam(team.id, { montoApuesta: t });
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
            updateTeam(team.id, { montoMarcas: t });
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
            updateTeam(team.id, { montoMedal: t });
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
            updateTeam(team.id, { notas: t });
          }}
        />

        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.roundsPlayed}</Text>
            <Text style={styles.statLabel}>Rondas jugadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.matchWins}-{stats.matchLosses}</Text>
            <Text style={styles.statLabel}>Match (G-P)</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.marcasWins}-{stats.marcasLosses}</Text>
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
            const t = teamEntryTotal(item);
            const pos = t >= 0;
            return (
              <TouchableOpacity
                style={styles.entryCard}
                onPress={() => router.push(`/teamEntry/${item.id}`)}
                onLongPress={() =>
                  confirmDelete('Eliminar entrada', `¿Eliminar la entrada del ${formatDate(item.fecha)}?`, () =>
                    deleteTeamEntry(item.id)
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

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTeam}>
          <Text style={styles.deleteText}>Eliminar Equipo</Text>
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
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  nameLink: { textDecorationLine: 'underline', color: colors.primary },
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
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
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
