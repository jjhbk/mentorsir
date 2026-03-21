import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogsStore } from '../../store/useLogsStore';
import { useTestsStore } from '../../store/useTestsStore';
import { colors } from '../../theme/colors';

export default function MeScreen() {
  const { profile, signOut } = useAuthStore();
  const { logs } = useLogsStore();
  const { tests } = useTestsStore();
  const [trackingRange, setTrackingRange] = React.useState<'weekly' | 'monthly' | 'all'>('weekly');

  const last30 = Object.values(logs).slice(0, 30);
  const avgStudy = last30.length
    ? (last30.reduce((a, l) => a + l.studyHours, 0) / last30.length).toFixed(1)
    : '—';
  const avgSleep = last30.length
    ? (last30.reduce((a, l) => a + l.sleepHours, 0) / last30.length).toFixed(1)
    : '—';
  const streak = computeStreak(Object.keys(logs).sort().reverse());
  const avgScore = tests.length
    ? Math.round(tests.reduce((a, t) => a + (t.score / t.totalQuestions) * 100, 0) / tests.length)
    : null;
  const sortedLogRows = useMemo(
    () => Object.values(logs).slice().sort((a, b) => a.date.localeCompare(b.date)),
    [logs]
  );
  const sleepSeriesAll = useMemo(
    () =>
      sortedLogRows.map((row) => ({
        label: new Date(row.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: row.sleepHours,
      })),
    [sortedLogRows]
  );
  const studySeriesAll = useMemo(
    () =>
      sortedLogRows.map((row) => ({
        label: new Date(row.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: row.studyHours,
      })),
    [sortedLogRows]
  );
  const rangeCount = trackingRange === 'weekly' ? 7 : trackingRange === 'monthly' ? 30 : Number.MAX_SAFE_INTEGER;
  const sleepSeries = useMemo(
    () => (rangeCount === Number.MAX_SAFE_INTEGER ? sleepSeriesAll : sleepSeriesAll.slice(-rangeCount)),
    [sleepSeriesAll, rangeCount]
  );
  const studySeries = useMemo(
    () => (rangeCount === Number.MAX_SAFE_INTEGER ? studySeriesAll : studySeriesAll.slice(-rangeCount)),
    [studySeriesAll, rangeCount]
  );
  const testSeries = useMemo(
    () =>
      tests
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-10)
        .map((t, idx) => ({
          label: String(idx + 1),
          value: t.totalQuestions > 0 ? Math.round((t.score / t.totalQuestions) * 100) : 0,
        })),
    [tests]
  );

  const initial = (profile?.name?.[0] ?? 'S').toUpperCase();

  const handleSignOut = () =>
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={s.profileSection}>
          {/* Avatar with accent ring */}
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initial}</Text>
            </View>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.name}>{profile?.name ?? 'Scholar'}</Text>
            <View style={s.roleBadge}>
              <Text style={s.roleText}>PTP 2.0</Text>
            </View>
          </View>
        </View>

        {/* 30-day stats — 2×2 bordered cells */}
        <View style={s.statsSection}>
          <Text style={s.sectionLabel}>30-day summary</Text>
          <View style={s.statsGrid}>
            <StatCell value={avgStudy} unit="h" label="avg study" />
            <StatCell value={avgSleep} unit="h" label="avg sleep" />
            <StatCell value={String(streak)} unit="d" label="streak" />
            <StatCell
              value={avgScore !== null ? `${avgScore}` : '—'}
              unit={avgScore !== null ? '%' : ''}
              label="avg score"
              highlight={avgScore !== null && avgScore >= 75}
            />
          </View>
          <Text style={s.avgScoreHelp}>
            Avg score = average percentage across all tests ({tests.length} test{tests.length === 1 ? '' : 's'}).
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Sleep Tracking</Text>
          <RangeToggle value={trackingRange} onChange={setTrackingRange} />
          <TimelineLineChart data={sleepSeries} color={colors.accent} suffix="h" emptyText="No sleep logs yet." />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Study Tracking</Text>
          <RangeToggle value={trackingRange} onChange={setTrackingRange} />
          <TimelineLineChart data={studySeries} color={colors.success} suffix="h" emptyText="No study logs yet." />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Previous Test Records</Text>
          <MiniBarChart data={testSeries} color={colors.warning} suffix="%" emptyText="No tests recorded yet." />
        </View>

        {/* Profile info */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Profile</Text>
          <View style={s.infoCard}>
            <InfoRow label="Name" value={profile?.name ?? '—'} />
            <View style={s.rowDivider} />
            <InfoRow label="Mobile" value={profile?.mobile ?? '—'} />
            <View style={s.rowDivider} />
            <InfoRow label="Program" value="PTP 2.0 — Prelims Training" />
          </View>
        </View>

        {/* Activity totals */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Activity</Text>
          <View style={s.infoCard}>
            <InfoRow label="Days logged" value={String(Object.keys(logs).length)} />
            <View style={s.rowDivider} />
            <InfoRow label="Tests recorded" value={String(tests.length)} />
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn} activeOpacity={0.8}>
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function computeStreak(sortedDates: string[]): number {
  if (!sortedDates.length) return 0;
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let expected = today;
  for (const date of sortedDates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else break;
  }
  return streak;
}

function StatCell({ value, unit, label, highlight }: {
  value: string; unit: string; label: string; highlight?: boolean;
}) {
  return (
    <View style={[stat.cell, highlight && stat.cellHighlight]}>
      <View style={stat.valueRow}>
        <Text style={[stat.value, highlight && stat.valueHighlight]}>{value}</Text>
        {unit ? <Text style={[stat.unit, highlight && stat.unitHighlight]}>{unit}</Text> : null}
      </View>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={info.row}>
      <Text style={info.label}>{label}</Text>
      <Text style={info.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MiniBarChart({
  data,
  color,
  suffix,
  emptyText,
}: {
  data: Array<{ label: string; value: number }>;
  color: string;
  suffix: string;
  emptyText: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) {
    return (
      <View style={chart.emptyWrap}>
        <Text style={chart.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={chart.card}>
      <View style={chart.barsRow}>
        {data.map((d) => (
          <View key={`${d.label}-${d.value}`} style={chart.barCol}>
            <Text style={chart.valText}>{d.value.toFixed(1)}{suffix}</Text>
            <View style={chart.track}>
              <View style={[chart.fill, { backgroundColor: color, height: `${Math.max(8, (d.value / max) * 100)}%` }]} />
            </View>
            <Text style={chart.labelText}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TimelineLineChart({
  data,
  color,
  suffix,
  emptyText,
}: {
  data: Array<{ label: string; value: number }>;
  color: string;
  suffix: string;
  emptyText: string;
}) {
  if (data.length === 0) {
    return (
      <View style={chart.emptyWrap}>
        <Text style={chart.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.value));
  const chartHeight = 112;
  const pointGap = 26;
  const xPad = 10;
  const chartWidth = Math.max(300, xPad * 2 + pointGap * Math.max(0, data.length - 1));
  const labelEvery = data.length > 30 ? 4 : data.length > 15 ? 2 : 1;

  return (
    <View style={chart.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[chart.lineCanvas, { width: chartWidth, height: chartHeight }]}>
            {data.map((d, i) => {
              const x = xPad + i * pointGap;
              const y = chartHeight - (d.value / max) * (chartHeight - 10) - 4;
              return (
                <View key={`pt-${i}`} style={[chart.point, { left: x - 4, top: y - 4, backgroundColor: color }]} />
              );
            })}
            {data.slice(1).map((d, i) => {
              const prev = data[i];
              const x1 = xPad + i * pointGap;
              const y1 = chartHeight - (prev.value / max) * (chartHeight - 10) - 4;
              const x2 = xPad + (i + 1) * pointGap;
              const y2 = chartHeight - (d.value / max) * (chartHeight - 10) - 4;
              return (
                <React.Fragment key={`seg-${i}`}>
                  <View
                    style={[
                      chart.segmentH,
                      {
                        left: x1,
                        top: y1,
                        width: x2 - x1,
                        backgroundColor: color,
                      },
                    ]}
                  />
                  <View
                    style={[
                      chart.segmentV,
                      {
                        left: x2 - 1,
                        top: Math.min(y1, y2),
                        height: Math.max(2, Math.abs(y2 - y1)),
                        backgroundColor: color,
                      },
                    ]}
                  />
                </React.Fragment>
              );
            })}
          </View>
          <View style={[chart.labelsRow, { width: chartWidth }]}>
            {data.map((d, i) => (
              <View key={`lb-${i}`} style={[chart.labelCell, { width: pointGap }]}>
                <Text style={chart.labelText}>{i % labelEvery === 0 ? d.label : ''}</Text>
                <Text style={chart.valText}>{i % labelEvery === 0 ? `${d.value.toFixed(1)}${suffix}` : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function RangeToggle({
  value,
  onChange,
}: {
  value: 'weekly' | 'monthly' | 'all';
  onChange: (next: 'weekly' | 'monthly' | 'all') => void;
}) {
  const options: Array<{ value: 'weekly' | 'monthly' | 'all'; label: string }> = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <View style={s.rangeToggleRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[s.rangeToggleBtn, value === opt.value && s.rangeToggleBtnActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[s.rangeToggleText, value === opt.value && s.rangeToggleTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    gap: 16,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: colors.surface },
  profileInfo: { gap: 6 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 10, fontWeight: '700', color: colors.accent,
    textTransform: 'uppercase', letterSpacing: 2,
  },

  statsSection: { marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textFaint,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12,
  },
  rangeToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  rangeToggleBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  rangeToggleBtnActive: { backgroundColor: colors.accentLight, borderColor: colors.accent },
  rangeToggleText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  rangeToggleTextActive: { color: colors.accent },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  rowDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },

  signOutBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.dangerLight,
    alignItems: 'center',
    backgroundColor: colors.dangerSubtle,
  },
  signOutText: { fontSize: 14, color: colors.danger, fontWeight: '700' },
  avgScoreHelp: { marginTop: 10, color: colors.textMuted, fontSize: 12 },
});

const stat = StyleSheet.create({
  cell: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cellHighlight: {
    backgroundColor: colors.successSubtle,
    borderColor: colors.successLight,
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 4 },
  value: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  valueHighlight: { color: colors.success },
  unit: { fontSize: 15, fontWeight: '500', color: colors.textMuted, marginBottom: 2 },
  unitHighlight: { color: colors.success },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
});

const info = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { fontSize: 15, color: colors.textMuted },
  value: { fontSize: 15, color: colors.text, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16 },
});

const chart = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center' },
  valText: { fontSize: 10, color: colors.textMuted, marginBottom: 4 },
  lineCanvas: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  segmentH: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
  },
  segmentV: {
    position: 'absolute',
    width: 2,
    borderRadius: 2,
  },
  point: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelsRow: { flexDirection: 'row', marginTop: 8, marginLeft: 2 },
  labelCell: { alignItems: 'center' },
  track: {
    width: '100%',
    height: 86,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: { width: '100%', borderRadius: 6 },
  labelText: { marginTop: 4, fontSize: 10, color: colors.textFaint },
  emptyWrap: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: { color: colors.textMuted, fontSize: 13 },
});
