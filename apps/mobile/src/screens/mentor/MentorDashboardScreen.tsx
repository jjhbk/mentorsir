import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';

const todayISO = new Date().toISOString().slice(0, 10);
const yesterdayISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

export default function MentorDashboardScreen() {
  const { profile } = useAuthStore();
  const { students, loading, fetchStudents } = useStudentsStore();

  useEffect(() => { fetchStudents(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const total = students.length;
  const loggedToday = students.filter((s) => s.latestLog?.date === todayISO).length;
  const loggedYesterday = students.filter((s) => s.latestLog?.date === yesterdayISO).length;
  const atRisk = students.filter(
    (s) => !s.latestLog || s.latestLog.studyHours < 4
  );
  const activeToday = students.filter((s) => s.latestLog?.date === todayISO);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.label}>Mentor</Text>
          <Text style={s.title}>{profile?.name?.split(' ')[0] ?? 'Dashboard'}</Text>
        </View>

        {/* Big number row */}
        <View style={s.numbersRow}>
          <BigNumber value={total} label="students" />
          <View style={s.numDivider} />
          <BigNumber value={loggedToday} label="logged today" accent />
          <View style={s.numDivider} />
          <BigNumber value={atRisk.length} label="at risk" danger={atRisk.length > 0} />
        </View>

        <View style={s.divider} />

        {/* Yesterday comparison */}
        <View style={s.comparisonRow}>
          <Text style={s.comparisonLabel}>Yesterday</Text>
          <Text style={s.comparisonValue}>{loggedYesterday} of {total} logged</Text>
        </View>

        <View style={s.divider} />

        {/* At-risk section */}
        {atRisk.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Needs attention</Text>
            {atRisk.slice(0, 5).map((st, idx) => (
              <View key={st.id} style={[s.studentRow, idx < atRisk.length - 1 && s.studentRowBordered]}>
                <View style={s.riskDot} />
                <View style={s.studentInfo}>
                  <Text style={s.studentName}>{st.name ?? 'Unknown'}</Text>
                  <Text style={s.studentDetail}>
                    {st.latestLog
                      ? `${st.latestLog.date} · ${st.latestLog.studyHours}h`
                      : 'No logs yet'}
                  </Text>
                </View>
              </View>
            ))}
            {atRisk.length > 5 && (
              <Text style={s.moreText}>+{atRisk.length - 5} more</Text>
            )}
          </View>
        )}

        {/* Active today */}
        {activeToday.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Active today</Text>
            {activeToday.slice(0, 6).map((st, idx) => (
              <View key={st.id} style={[s.studentRow, idx < activeToday.length - 1 && s.studentRowBordered]}>
                <View style={s.activeDot} />
                <View style={s.studentInfo}>
                  <Text style={s.studentName}>{st.name ?? 'Unknown'}</Text>
                  <Text style={s.studentDetail}>
                    {st.latestLog!.studyHours}h · tasks: {st.latestLog!.taskCompleted}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BigNumber({ value, label, accent, danger }: {
  value: number; label: string; accent?: boolean; danger?: boolean;
}) {
  const valueColor = danger && value > 0
    ? colors.danger
    : accent && value > 0
    ? colors.success
    : colors.text;
  return (
    <View style={bn.wrap}>
      <Text style={[bn.value, { color: valueColor }]}>{value}</Text>
      <Text style={bn.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 24, paddingBottom: 48 },
  header: { paddingTop: 36, paddingBottom: 28 },
  label: {
    fontSize: 11, fontWeight: '700', color: colors.accent,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 28,
  },
  numDivider: { width: 1, height: 40, backgroundColor: colors.border, marginHorizontal: 20 },
  divider: { height: 1, backgroundColor: colors.divider },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  comparisonLabel: { fontSize: 14, color: colors.textMuted },
  comparisonValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  section: { paddingTop: 24, paddingBottom: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  studentRowBordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  riskDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.danger,
  },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.success,
  },
  studentInfo: { gap: 2 },
  studentName: { fontSize: 15, fontWeight: '600', color: colors.text },
  studentDetail: { fontSize: 12, color: colors.textMuted },
  moreText: { fontSize: 13, color: colors.textMuted, paddingTop: 8 },
});

const bn = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center' },
  value: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  label: {
    fontSize: 11, color: colors.textMuted, marginTop: 4,
    textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600',
    textAlign: 'center',
  },
});
