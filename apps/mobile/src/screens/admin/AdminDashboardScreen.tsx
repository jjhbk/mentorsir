import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  SafeAreaView, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';

const todayISO = new Date().toISOString().slice(0, 10);
const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

export default function AdminDashboardScreen() {
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
  const activeToday = students.filter((s) => s.latestLog?.date === todayISO).length;
  const activeThisWeek = students.filter((s) => s.latestLog && s.latestLog.date >= sevenDaysAgo).length;
  const neverLogged = students.filter((s) => !s.latestLog).length;
  const atRisk = students.filter((s) => !s.latestLog || s.latestLog.studyHours < 4).length;
  const engRate = total > 0 ? Math.round((activeToday / total) * 100) : 0;
  const weeklyRate = total > 0 ? Math.round((activeThisWeek / total) * 100) : 0;

  // Average study hours (students who logged today)
  const todayLogs = students.filter((s) => s.latestLog?.date === todayISO);
  const avgStudy = todayLogs.length
    ? (todayLogs.reduce((a, s) => a + (s.latestLog?.studyHours ?? 0), 0) / todayLogs.length).toFixed(1)
    : '—';

  // Group students by mentorId to get per-mentor stats
  const mentorMap: Record<string, { count: number; active: number }> = {};
  for (const st of students) {
    const mid = (st as any).mentorId ?? 'unassigned';
    if (!mentorMap[mid]) mentorMap[mid] = { count: 0, active: 0 };
    mentorMap[mid].count++;
    if (st.latestLog?.date === todayISO) mentorMap[mid].active++;
  }
  const mentorCount = Object.keys(mentorMap).filter((k) => k !== 'unassigned').length;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.label}>Admin</Text>
            <Text style={s.title}>Founder{'\n'}Dashboard</Text>
          </View>
          <View style={s.programBadge}>
            <Text style={s.programBadgeText}>PTP 2.0</Text>
          </View>
        </View>

        {/* Today's snapshot */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Today's snapshot</Text>
          <View style={s.metricsGrid}>
            <MetricCard value={total} label="Enrolled" icon="users" color={colors.text} />
            <MetricCard value={activeToday} label="Active today" icon="activity" color={colors.success} bg={colors.successSubtle} border={colors.successLight} />
            <MetricCard value={atRisk} label="At risk" icon="alert-triangle" color={atRisk > 0 ? colors.danger : colors.text} bg={atRisk > 0 ? colors.dangerSubtle : undefined} border={atRisk > 0 ? colors.dangerLight : undefined} />
            <MetricCard value={`${engRate}%`} label="Engagement" icon="zap" color={colors.accent} bg={colors.accentSubtle} border={colors.accentLight} />
          </View>
        </View>

        {/* Programme health */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Programme health</Text>
          <View style={s.healthCard}>
            <HealthRow icon="calendar" label="7-day active rate" value={`${weeklyRate}%`} color={weeklyRate >= 60 ? colors.success : colors.warning} />
            <View style={s.hDiv} />
            <HealthRow icon="clock" label="Avg study hrs (today)" value={`${avgStudy}h`} color={colors.accent} />
            <View style={s.hDiv} />
            <HealthRow icon="user-x" label="Never logged" value={String(neverLogged)} color={neverLogged > 0 ? colors.danger : colors.success} />
            <View style={s.hDiv} />
            <HealthRow icon="users" label="Mentors active" value={String(mentorCount)} color={colors.text} />
          </View>
        </View>

        {/* Engagement bar */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Daily engagement</Text>
          <View style={s.engCard}>
            <View style={s.engBarRow}>
              <Text style={s.engBarLabel}>Today</Text>
              <View style={s.engBarTrack}>
                <View style={[s.engBarFill, { width: `${engRate}%`, backgroundColor: engRate >= 70 ? colors.success : engRate >= 40 ? colors.warning : colors.danger }]} />
              </View>
              <Text style={s.engBarValue}>{activeToday}/{total}</Text>
            </View>
            <View style={s.engBarRow}>
              <Text style={s.engBarLabel}>7-day</Text>
              <View style={s.engBarTrack}>
                <View style={[s.engBarFill, { width: `${weeklyRate}%`, backgroundColor: weeklyRate >= 70 ? colors.success : weeklyRate >= 40 ? colors.warning : colors.danger }]} />
              </View>
              <Text style={s.engBarValue}>{activeThisWeek}/{total}</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Quick actions</Text>
          <View style={s.actionsCard}>
            <ActionRow icon="user-plus" label="Add new student" sub="Enroll a student into the cohort" onPress={() => {}} />
            <View style={s.hDiv} />
            <ActionRow icon="user-check" label="Add new mentor" sub="Assign a mentor to the programme" onPress={() => {}} />
            <View style={s.hDiv} />
            <ActionRow icon="download" label="Export cohort data" sub="Download full engagement report" onPress={() => {}} />
            <View style={s.hDiv} />
            <ActionRow icon="settings" label="Programme settings" sub="Fees, schedule templates, intake form" onPress={() => {}} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ value, label, icon, color, bg, border }: {
  value: number | string; label: string; icon: string;
  color: string; bg?: string; border?: string;
}) {
  return (
    <View style={[mc.wrap, bg && { backgroundColor: bg }, border && { borderColor: border }]}>
      <Icon name={icon} size={16} color={color} style={{ marginBottom: 8 }} />
      <Text style={[mc.value, { color }]}>{value}</Text>
      <Text style={mc.label}>{label}</Text>
    </View>
  );
}

function HealthRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={s.healthRow}>
      <View style={s.healthIcon}>
        <Icon name={icon} size={15} color={colors.textMuted} />
      </View>
      <Text style={s.healthLabel}>{label}</Text>
      <Text style={[s.healthValue, { color }]}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, sub, onPress }: { icon: string; label: string; sub: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.actionRow} onPress={onPress} activeOpacity={0.75}>
      <View style={s.actionIcon}>
        <Icon name={icon} size={18} color={colors.textMuted} />
      </View>
      <View style={s.actionInfo}>
        <Text style={s.actionLabel}>{label}</Text>
        <Text style={s.actionSub}>{sub}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textFaint} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  header: {
    paddingTop: 36, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  label: {
    fontSize: 10, fontWeight: '700', color: colors.accent,
    textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -1, lineHeight: 36 },
  programBadge: {
    backgroundColor: colors.darkCard,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4,
  },
  programBadgeText: { fontSize: 12, fontWeight: '800', color: colors.darkText, letterSpacing: 1 },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textFaint,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10,
  },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  healthCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  healthRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  healthIcon: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  healthLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
  healthValue: { fontSize: 15, fontWeight: '800' },
  hDiv: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },

  engCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, gap: 14,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  engBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  engBarLabel: { fontSize: 12, color: colors.textMuted, width: 40, fontWeight: '600' },
  engBarTrack: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4 },
  engBarFill: { height: 8, borderRadius: 4 },
  engBarValue: { fontSize: 12, color: colors.textMuted, width: 36, textAlign: 'right' },

  actionsCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  actionIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  actionInfo: { flex: 1, gap: 2 },
  actionLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  actionSub: { fontSize: 12, color: colors.textMuted },
});

const mc = StyleSheet.create({
  wrap: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: 14, alignItems: 'flex-start',
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  value: { fontSize: 30, fontWeight: '800', letterSpacing: -1, lineHeight: 34, marginBottom: 2 },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
});
