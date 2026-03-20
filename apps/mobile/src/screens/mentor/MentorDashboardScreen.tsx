import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { MentorDashboardStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MentorDashboardStackParamList, 'MentorHome'>;

const todayISO = new Date().toISOString().slice(0, 10);
const yesterdayISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

export default function MentorDashboardScreen() {
  const navigation = useNavigation<Nav>();
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
  const atRisk = students.filter((s) => !s.latestLog || s.latestLog.studyHours < 4);
  const activeToday = students.filter((s) => s.latestLog?.date === todayISO);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.label}>Mentor</Text>
            <Text style={s.title}>{profile?.name?.split(' ')[0] ?? 'Dashboard'}</Text>
          </View>
          {/* Alerts bell */}
          <TouchableOpacity
            style={[s.bellBtn, atRisk.length > 0 && s.bellBtnAlert]}
            onPress={() => navigation.navigate('Alerts')}
            activeOpacity={0.8}
          >
            <Icon name="bell" size={20} color={atRisk.length > 0 ? colors.danger : colors.textMuted} />
            {atRisk.length > 0 && (
              <View style={s.bellBadge}>
                <Text style={s.bellBadgeText}>{atRisk.length > 9 ? '9+' : atRisk.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Summary cards row */}
        <View style={s.summaryRow}>
          <SummaryCard value={total} label="Students" />
          <SummaryCard
            value={loggedToday}
            label="Active today"
            color={loggedToday > 0 ? colors.success : colors.textMuted}
            bg={loggedToday > 0 ? colors.successSubtle : undefined}
            border={loggedToday > 0 ? colors.successLight : undefined}
          />
          <SummaryCard
            value={atRisk.length}
            label="At risk"
            color={atRisk.length > 0 ? colors.danger : colors.textMuted}
            bg={atRisk.length > 0 ? colors.dangerSubtle : undefined}
            border={atRisk.length > 0 ? colors.dangerLight : undefined}
          />
        </View>

        {/* Yesterday comparison */}
        <View style={s.compRow}>
          <Text style={s.compLabel}>Yesterday</Text>
          <Text style={s.compValue}>{loggedYesterday} of {total} logged</Text>
        </View>

        {/* At-risk section */}
        {atRisk.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: colors.danger }]} />
              <Text style={[s.sectionLabel, { color: colors.danger }]}>Needs attention</Text>
            </View>
            <View style={[s.sectionCard, s.dangerCard]}>
              {atRisk.slice(0, 5).map((st, idx) => (
                <View key={st.id}>
                  {idx > 0 && <View style={s.rowDivider} />}
                  <View style={s.studentRow}>
                    <View style={s.studentInitial}>
                      <Text style={s.studentInitialText}>{(st.name?.[0] ?? '?').toUpperCase()}</Text>
                    </View>
                    <View style={s.studentInfo}>
                      <Text style={s.studentName}>{st.name ?? 'Unknown'}</Text>
                      <Text style={s.studentDetail}>
                        {st.latestLog
                          ? `Last logged ${st.latestLog.date} · ${st.latestLog.studyHours}h`
                          : 'No logs yet'}
                      </Text>
                    </View>
                    <View style={s.riskBadge}>
                      <Text style={s.riskBadgeText}>
                        {!st.latestLog ? 'Never' : `${st.latestLog.studyHours}h`}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {atRisk.length > 5 && (
                <Text style={s.moreText}>+{atRisk.length - 5} more</Text>
              )}
            </View>
          </View>
        )}

        {/* Active today */}
        {activeToday.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: colors.success }]} />
              <Text style={[s.sectionLabel, { color: colors.success }]}>Active today</Text>
            </View>
            <View style={[s.sectionCard, s.successCard]}>
              {activeToday.slice(0, 6).map((st, idx) => (
                <View key={st.id}>
                  {idx > 0 && <View style={s.rowDivider} />}
                  <View style={s.studentRow}>
                    <View style={[s.studentInitial, s.studentInitialSuccess]}>
                      <Text style={s.studentInitialText}>{(st.name?.[0] ?? '?').toUpperCase()}</Text>
                    </View>
                    <View style={s.studentInfo}>
                      <Text style={s.studentName}>{st.name ?? 'Unknown'}</Text>
                      <Text style={s.studentDetail}>
                        {st.latestLog!.studyHours}h · tasks: {st.latestLog!.taskCompleted}
                      </Text>
                    </View>
                    <View style={s.activeBadge}>
                      <Text style={s.activeBadgeText}>{st.latestLog!.studyHours}h</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ value, label, color, bg, border }: {
  value: number; label: string;
  color?: string; bg?: string; border?: string;
}) {
  return (
    <View style={[
      sc.wrap,
      bg && { backgroundColor: bg },
      border && { borderColor: border },
    ]}>
      <Text style={[sc.value, color && { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  header: { paddingTop: 36, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  bellBtnAlert: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.dangerLight,
  },
  bellBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: colors.danger,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },
  label: {
    fontSize: 10, fontWeight: '700', color: colors.accent,
    textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -1 },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  compLabel: { fontSize: 14, color: colors.textMuted },
  compValue: { fontSize: 14, fontWeight: '700', color: colors.text },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5,
  },
  sectionCard: {
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
  dangerCard: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.dangerLight,
  },
  successCard: {
    backgroundColor: colors.successSubtle,
    borderColor: colors.successLight,
  },

  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 14 },
  studentInitial: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
  },
  studentInitialSuccess: { backgroundColor: colors.successLight },
  studentInitialText: { fontSize: 13, fontWeight: '800', color: colors.text },
  studentInfo: { flex: 1, gap: 2 },
  studentName: { fontSize: 15, fontWeight: '600', color: colors.text },
  studentDetail: { fontSize: 12, color: colors.textMuted },

  riskBadge: {
    backgroundColor: colors.dangerLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  riskBadgeText: { fontSize: 12, fontWeight: '700', color: colors.danger },
  activeBadge: {
    backgroundColor: colors.successLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '700', color: colors.success },

  moreText: { fontSize: 13, color: colors.textMuted, padding: 14, paddingTop: 8 },
});

const sc = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 40,
  },
  label: {
    fontSize: 10, color: colors.textMuted, marginTop: 3,
    textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '600',
    textAlign: 'center',
  },
});
