import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useStudentsStore } from '../../store/useStudentsStore';
import { colors } from '../../theme/colors';

const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

type Severity = 'high' | 'medium' | 'low';
interface AlertItem {
  id: string;
  name: string;
  message: string;
  detail: string;
  severity: Severity;
}

const SEVERITY_CONFIG: Record<Severity, {
  color: string; bg: string; border: string; label: string;
}> = {
  high: {
    color: colors.danger,
    bg: colors.dangerSubtle,
    border: colors.dangerLight,
    label: 'Critical',
  },
  medium: {
    color: colors.warning,
    bg: colors.warningSubtle,
    border: colors.warningLight,
    label: 'Warning',
  },
  low: {
    color: colors.accent,
    bg: colors.accentSubtle,
    border: colors.accentLight,
    label: 'Info',
  },
};

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export default function AlertsScreen() {
  const { students, loading, fetchStudents } = useStudentsStore();

  useEffect(() => { fetchStudents(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const alerts: AlertItem[] = students
    .flatMap((st): AlertItem[] => {
      if (!st.latestLog) {
        return [{
          id: `${st.id}-nolog`,
          name: st.name ?? 'Unknown',
          message: 'Never logged',
          detail: 'No daily log submitted since joining.',
          severity: 'high',
        }];
      }
      if (st.latestLog.date < threeDaysAgo) {
        return [{
          id: `${st.id}-inactive`,
          name: st.name ?? 'Unknown',
          message: 'Inactive 3+ days',
          detail: `Last activity: ${st.latestLog.date}`,
          severity: 'high',
        }];
      }
      if (st.latestLog.studyHours < 4) {
        return [{
          id: `${st.id}-hours`,
          name: st.name ?? 'Unknown',
          message: 'Low study hours',
          detail: `${st.latestLog.studyHours}h on last log day`,
          severity: 'medium',
        }];
      }
      if (st.latestLog.taskCompleted === 'no') {
        return [{
          id: `${st.id}-task`,
          name: st.name ?? 'Unknown',
          message: 'Tasks not completed',
          detail: `Last log: ${st.latestLog.date}`,
          severity: 'low',
        }];
      }
      return [];
    })
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const high = alerts.filter((a) => a.severity === 'high').length;
  const medium = alerts.filter((a) => a.severity === 'medium').length;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Alerts</Text>
        {alerts.length > 0 ? (
          <View style={s.summaryRow}>
            {high > 0 && (
              <View style={[s.summaryPill, { backgroundColor: colors.dangerSubtle, borderColor: colors.dangerLight }]}>
                <View style={[s.pillDot, { backgroundColor: colors.danger }]} />
                <Text style={[s.pillText, { color: colors.danger }]}>{high} critical</Text>
              </View>
            )}
            {medium > 0 && (
              <View style={[s.summaryPill, { backgroundColor: colors.warningSubtle, borderColor: colors.warningLight }]}>
                <View style={[s.pillDot, { backgroundColor: colors.warning }]} />
                <Text style={[s.pillText, { color: colors.warning }]}>{medium} warning{medium > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={s.sub}>All clear</Text>
        )}
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const cfg = SEVERITY_CONFIG[item.severity];
          return (
            <View style={[s.alertCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <View style={[s.accentBar, { backgroundColor: cfg.color }]} />
              <View style={s.alertBody}>
                <View style={s.alertTop}>
                  <Text style={s.alertName}>{item.name}</Text>
                  <View style={[s.severityBadge, { backgroundColor: cfg.color + '20' }]}>
                    <Text style={[s.severityText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={[s.alertMessage, { color: cfg.color }]}>{item.message}</Text>
                <Text style={s.alertDetail}>{item.detail}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>✓</Text>
            <Text style={s.emptyTitle}>All students on track</Text>
            <Text style={s.emptyHint}>No alerts at this time.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.8, marginBottom: 10 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, fontWeight: '700' },

  list: { paddingHorizontal: 20, paddingBottom: 48 },

  alertCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  alertBody: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 3 },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  alertName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  severityBadge: {
    borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, marginLeft: 8,
  },
  severityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  alertMessage: { fontSize: 13, fontWeight: '600' },
  alertDetail: { fontSize: 12, color: colors.textMuted },

  empty: { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyIcon: {
    fontSize: 32,
    color: colors.success,
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyHint: { fontSize: 14, color: colors.textMuted },
});
