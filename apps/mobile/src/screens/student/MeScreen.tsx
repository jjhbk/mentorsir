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
        </View>

        {/* Profile info */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Profile</Text>
          <View style={s.infoCard}>
            <InfoRow label="Name" value={profile?.name ?? '—'} />
            <View style={s.rowDivider} />
            <InfoRow label="Mobile" value={profile?.mobile ?? '—'} />
            <View style={s.rowDivider} />
            <InfoRow label="Program" value="PTP 2.0 — Prelims Training" last />
          </View>
        </View>

        {/* Activity totals */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Activity</Text>
          <View style={s.infoCard}>
            <InfoRow label="Days logged" value={String(Object.keys(logs).length)} />
            <View style={s.rowDivider} />
            <InfoRow label="Tests recorded" value={String(tests.length)} last />
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

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={info.row}>
      <Text style={info.label}>{label}</Text>
      <Text style={info.value} numberOfLines={1}>{value}</Text>
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
