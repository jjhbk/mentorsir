import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Linking, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentsStore } from '../../store/useStudentsStore';
import { colors } from '../../theme/colors';

const todayISO = new Date().toISOString().slice(0, 10);

export default function MentorToolsScreen() {
  const { profile } = useAuthStore();
  const { students, fetchStudents } = useStudentsStore();

  useEffect(() => { fetchStudents(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = students.length;
  const activeToday = students.filter((s) => s.latestLog?.date === todayISO).length;
  const atRisk = students.filter((s) => !s.latestLog || s.latestLog.studyHours < 4).length;
  const engagementPct = total > 0 ? Math.round((activeToday / total) * 100) : 0;

  const openLink = (url: string | null | undefined, name: string) => {
    if (!url) { Alert.alert(`${name} link not set`); return; }
    Linking.openURL(url).catch(() => Alert.alert('Could not open link'));
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.label}>Mentor</Text>
          <Text style={s.title}>Tools</Text>
        </View>

        {/* Cohort pulse */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Cohort pulse</Text>
          <View style={s.pulseCard}>
            <PulseStat value={total} label="Total" color={colors.text} />
            <View style={s.pulseDivider} />
            <PulseStat value={activeToday} label="Active today" color={colors.success} />
            <View style={s.pulseDivider} />
            <PulseStat value={atRisk} label="At risk" color={atRisk > 0 ? colors.danger : colors.text} />
            <View style={s.pulseDivider} />
            <PulseStat value={`${engagementPct}%`} label="Engagement" color={colors.accent} />
          </View>
        </View>

        {/* Communication */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Communication</Text>
          <View style={s.card}>
            <ToolRow
              icon="message-circle"
              label="Open Telegram group"
              sub="Send announcements to your cohort"
              onPress={() => openLink(profile?.telegramGroupLink, 'Telegram')}
            />
            <View style={s.rowDiv} />
            <ToolRow
              icon="phone"
              label="Open WhatsApp group"
              sub="Reach students on WhatsApp"
              onPress={() => openLink(profile?.whatsappGroupLink, 'WhatsApp')}
            />
            <View style={s.rowDiv} />
            <ToolRow
              icon="bell"
              label="Send reminder"
              sub="Nudge students who haven't logged today"
              onPress={() => Alert.alert('Coming soon', 'Bulk reminders will be available soon.')}
              accent
            />
          </View>
        </View>

        {/* Schedule tools */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Schedule</Text>
          <View style={s.card}>
            <ToolRow
              icon="calendar"
              label="Assign weekly schedule"
              sub="Set tasks for each student via Connect tab"
              onPress={() => Alert.alert('Go to Connect → Mentor tab to assign schedules.')}
            />
            <View style={s.rowDiv} />
            <ToolRow
              icon="book-open"
              label="Resource mapping"
              sub="Update subject → resource assignments"
              onPress={() => Alert.alert('Go to Connect → Mentor tab to manage resources.')}
            />
          </View>
        </View>

        {/* Analysis */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Analysis</Text>
          <View style={s.card}>
            <ToolRow
              icon="bar-chart-2"
              label="Cohort test performance"
              sub="View average scores and mistake patterns"
              onPress={() => Alert.alert('Coming soon', 'Cohort analytics will be available soon.')}
            />
            <View style={s.rowDiv} />
            <ToolRow
              icon="trending-up"
              label="Study hours trend"
              sub="7-day rolling average across cohort"
              onPress={() => Alert.alert('Coming soon', 'Study trends will be available soon.')}
            />
            <View style={s.rowDiv} />
            <ToolRow
              icon="download"
              label="Export student data"
              sub="Download cohort log sheet as CSV"
              onPress={() => Alert.alert('Coming soon', 'Data export will be available soon.')}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function PulseStat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <View style={s.pulseStat}>
      <Text style={[s.pulseValue, { color }]}>{value}</Text>
      <Text style={s.pulseLabel}>{label}</Text>
    </View>
  );
}

function ToolRow({ icon, label, sub, onPress, accent }: {
  icon: string; label: string; sub: string;
  onPress: () => void; accent?: boolean;
}) {
  return (
    <TouchableOpacity style={s.toolRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.toolIcon, accent && s.toolIconAccent]}>
        <Icon name={icon} size={18} color={accent ? colors.accent : colors.textMuted} />
      </View>
      <View style={s.toolInfo}>
        <Text style={[s.toolLabel, accent && s.toolLabelAccent]}>{label}</Text>
        <Text style={s.toolSub}>{sub}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textFaint} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  header: { paddingTop: 36, paddingBottom: 20 },
  label: {
    fontSize: 10, fontWeight: '700', color: colors.accent,
    textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -1 },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textFaint,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10,
  },

  pulseCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  pulseStat: { flex: 1, alignItems: 'center' },
  pulseDivider: { width: 1, backgroundColor: colors.divider },
  pulseValue: { fontSize: 26, fontWeight: '800', letterSpacing: -1, lineHeight: 30 },
  pulseLabel: {
    fontSize: 10, color: colors.textFaint, marginTop: 4,
    textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', textAlign: 'center',
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  rowDiv: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },

  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toolIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  toolIconAccent: { backgroundColor: colors.accentSubtle },
  toolInfo: { flex: 1, gap: 2 },
  toolLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  toolLabelAccent: { color: colors.accent },
  toolSub: { fontSize: 12, color: colors.textMuted, lineHeight: 16 },
});
