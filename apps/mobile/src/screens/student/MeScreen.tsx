import React from 'react';
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
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.name}>{profile?.name ?? 'Scholar'}</Text>
            <Text style={s.role}>PTP 2.0</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Key stats — typographic grid */}
        <View style={s.statsSection}>
          <Text style={s.statsSectionLabel}>30-day summary</Text>
          <View style={s.statsGrid}>
            <StatItem value={avgStudy} unit="h" label="avg study" />
            <StatItem value={avgSleep} unit="h" label="avg sleep" />
            <StatItem value={String(streak)} unit="d" label="current streak" />
            <StatItem value={avgScore !== null ? `${avgScore}` : '—'} unit={avgScore !== null ? '%' : ''} label="avg test score" />
          </View>
        </View>

        <View style={s.divider} />

        {/* Profile info rows */}
        <View style={s.infoSection}>
          <Text style={s.statsSectionLabel}>Profile</Text>
          <InfoRow label="Name" value={profile?.name ?? '—'} />
          <InfoRow label="Mobile" value={profile?.mobile ?? '—'} />
          <InfoRow label="Program" value="PTP 2.0 — Prelims Training" last />
        </View>

        <View style={s.divider} />

        {/* Totals */}
        <View style={s.infoSection}>
          <Text style={s.statsSectionLabel}>Activity</Text>
          <InfoRow label="Days logged" value={String(Object.keys(logs).length)} />
          <InfoRow label="Tests recorded" value={String(tests.length)} last />
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={s.signOut}>
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

function StatItem({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View style={stat.wrap}>
      <View style={stat.valueRow}>
        <Text style={stat.value}>{value}</Text>
        {unit ? <Text style={stat.unit}>{unit}</Text> : null}
      </View>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[info.row, !last && info.bordered]}>
      <Text style={info.label}>{label}</Text>
      <Text style={info.value}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 24, paddingBottom: 60 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: colors.surface },
  profileInfo: { gap: 3 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  role: {
    fontSize: 11, fontWeight: '700', color: colors.accent,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 4 },
  statsSection: { paddingVertical: 24 },
  statsSectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  infoSection: { paddingVertical: 24 },
  signOut: { marginTop: 32, paddingVertical: 8 },
  signOutText: { fontSize: 14, color: colors.danger, fontWeight: '600' },
});

const stat = StyleSheet.create({
  wrap: { width: '50%', paddingBottom: 24 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  value: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  unit: { fontSize: 16, fontWeight: '500', color: colors.textMuted, marginBottom: 2 },
  label: { fontSize: 12, color: colors.textMuted, marginTop: 3, fontWeight: '500' },
});

const info = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: { fontSize: 15, color: colors.textMuted },
  value: { fontSize: 15, color: colors.text, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16 },
});
