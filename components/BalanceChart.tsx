import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/colors';
import { formatDate } from '../lib/date';
import { BalancePoint } from '../lib/stats';

const WIDTH = 320;
const HEIGHT = 140;
const PAD = 12;

export function BalanceChart({ points }: { points: BalancePoint[] }) {
  if (points.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No hay historial todavía.</Text>
      </View>
    );
  }

  const values = points.map((p) => p.balance);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;

  const innerW = WIDTH - PAD * 2;
  const innerH = HEIGHT - PAD * 2;

  const x = (i: number) => (points.length === 1 ? PAD + innerW / 2 : PAD + (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD + innerH - ((v - min) / range) * innerH;

  const zeroY = y(0);
  const last = points[points.length - 1];
  const lastPositive = last.balance >= 0;
  const lineColor = lastPositive ? colors.positive : colors.negative;
  const linePoints = points.map((p, i) => `${x(i)},${y(p.balance)}`).join(' ');

  return (
    <View>
      <Svg width={WIDTH} height={HEIGHT}>
        <Line x1={PAD} y1={zeroY} x2={WIDTH - PAD} y2={zeroY} stroke={colors.border} strokeWidth={1} />
        <Polyline
          points={linePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={x(points.length - 1)} cy={y(last.balance)} r={4} fill={lineColor} />
      </Svg>
      <View style={styles.labelsRow}>
        <Text style={styles.labelText}>{formatDate(points[0].date)}</Text>
        <Text style={[styles.labelText, { color: lineColor, fontWeight: '700' }]}>
          {lastPositive ? '+' : ''}
          {last.balance.toFixed(2)}
        </Text>
        <Text style={styles.labelText}>{formatDate(last.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 12 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  labelText: { fontSize: 11, color: colors.textMuted },
});
