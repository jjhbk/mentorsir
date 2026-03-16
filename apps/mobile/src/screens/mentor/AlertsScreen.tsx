import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useStudentsStore } from '../../store/useStudentsStore';
import { colors } from '../../theme/colors';

const todayISO = new Date().toISOString().slice(0, 10);
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

type Severity = 'high' | 'medium' | 'low';
interface AlertItem {
  id: string;
  name: string;
  message: string;
  detail: string;
  severity: Severity;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  high: colors.danger,
  medium: colors.warning,
  low: colors.accent,
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
          <Text style={s.sub}>
            {high > 0 && `${high} critical`}
            {high > 0 && medium > 0 && ' · '}
            {medium > 0 && `${medium} warnings`}
          </Text>
        ) : (
          <Text style={s.sub}>All clear</Text>
        )}
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item }) => {
          const color = SEVERITY_COLOR[item.severity];
          return (
            <View style={s.alertRow}>
              <View style={[s.accentBar, { backgroundColor: color }]} />
              <View style={s.alertBody}>
                <View style={s.alertTop}>
                  <Text style={s.alertName}>{item.name}</Text>
                  <Text style={[s.alertSeverity, { color }]}>{item.message}</Text>
                </View>
                <Text style={s.alertDetail}>{item.detail}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
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
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  list: { paddingBottom: 48 },
  sep: { height: 1, backgroundColor: colors.divider, marginLeft: 24 + 3 },
  alertRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingRight: 24,
    paddingLeft: 24,
    gap: 14,
  },
  accentBar: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
    minHeight: 36,
  },
  alertBody: { flex: 1, gap: 4 },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  alertName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  alertSeverity: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  alertDetail: { fontSize: 13, color: colors.textMuted },
  empty: { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyHint: { fontSize: 14, color: colors.textMuted },
});
