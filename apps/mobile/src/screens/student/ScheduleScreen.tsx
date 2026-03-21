import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, TextInput, Alert,
} from 'react-native';
import { useScheduleStore } from '../../store/useScheduleStore';
import { useConnectStore } from '../../store/useConnectStore';
import { colors } from '../../theme/colors';
import { ScheduleEntry } from '../../types';
import { RESOURCE_MAPPING_TEMPLATE } from '../../data/resourceMappingTemplate';

const todayISO = new Date().toISOString().slice(0, 10);

const TYPE_ACCENT: Record<ScheduleEntry['entryType'], string> = {
  study: colors.accent,
  'ca-test': colors.warning,
  'sectional-test': colors.danger,
  'mentor-connect': colors.success,
};

const TYPE_BG: Record<ScheduleEntry['entryType'], string> = {
  study: colors.accentSubtle,
  'ca-test': colors.warningSubtle,
  'sectional-test': colors.dangerSubtle,
  'mentor-connect': colors.successSubtle,
};

const TYPE_SHORT: Record<ScheduleEntry['entryType'], string> = {
  study: 'Study',
  'ca-test': 'CA Test',
  'sectional-test': 'Test',
  'mentor-connect': 'Mentor',
};

function buildWeek(from: string, count = 7) {
  const base = new Date(from + 'T00:00:00');
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function ScheduleScreen() {
  const { entries, loading, fetchEntries, toggleCompleted, toggleRevision } = useScheduleStore();
  const { yearlyPlans, resourceMap, refreshAll, saveYearlyPlan } = useConnectStore();
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [planMonth, setPlanMonth] = useState('');
  const [planSubject1, setPlanSubject1] = useState('');
  const [planSubject2, setPlanSubject2] = useState('');
  const [planSubject3, setPlanSubject3] = useState('');
  const [planNotes, setPlanNotes] = useState('');

  useEffect(() => {
    fetchEntries();
    refreshAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const weekDates = buildWeek(todayISO);
  const dayEntries = entries.filter((e) => e.date === selectedDate);

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Schedule</Text>
      </View>

      {/* Week strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.weekContent}
        style={s.weekStrip}
      >
        {weekDates.map((date) => {
          const d = new Date(date + 'T00:00:00');
          const hasEntries = entries.some((e) => e.date === date);
          const active = date === selectedDate;
          return (
            <TouchableOpacity
              key={date}
              style={[s.dayTile, active && s.dayTileActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[s.dayName, active && s.dayNameActive]}>
                {d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 3)}
              </Text>
              <Text style={[s.dayNum, active && s.dayNumActive]}>
                {d.getDate()}
              </Text>
              <View style={[
                s.hasEntriesDot,
                hasEntries
                  ? active ? s.hasEntriesDotActive : s.hasEntriesDotInactive
                  : undefined,
              ]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected date summary */}
      <View style={s.dateSummary}>
        <Text style={s.dateSummaryText}>
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <View style={s.countBadge}>
          <Text style={s.countBadgeText}>
            {dayEntries.length} {dayEntries.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      {/* Entries */}
      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {dayEntries.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>Rest day</Text>
            <Text style={s.emptyHint}>Nothing scheduled for today.</Text>
          </View>
        ) : (
          dayEntries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onToggle={() => toggleCompleted(entry.id)}
              onRevision={(rev) => toggleRevision(entry.id, rev)}
            />
          ))
        )}

        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>Yearly Plan</Text>
          <TextInput style={s.input} placeholder="Month (JAN/FEB/MAR)" placeholderTextColor={colors.textFaint} value={planMonth} onChangeText={setPlanMonth} />
          <TextInput style={s.input} placeholder="Subject 1" placeholderTextColor={colors.textFaint} value={planSubject1} onChangeText={setPlanSubject1} />
          <TextInput style={s.input} placeholder="Subject 2" placeholderTextColor={colors.textFaint} value={planSubject2} onChangeText={setPlanSubject2} />
          <TextInput style={s.input} placeholder="Subject 3" placeholderTextColor={colors.textFaint} value={planSubject3} onChangeText={setPlanSubject3} />
          <TextInput style={s.input} placeholder="Notes" placeholderTextColor={colors.textFaint} value={planNotes} onChangeText={setPlanNotes} />
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={async () => {
              const result = await saveYearlyPlan(planMonth, planSubject1, planSubject2, planSubject3, planNotes);
              if (!result.ok) {
                Alert.alert('Unable to save plan', result.error ?? 'Try again.');
                return;
              }
              setPlanMonth('');
              setPlanSubject1('');
              setPlanSubject2('');
              setPlanSubject3('');
              setPlanNotes('');
            }}
          >
            <Text style={s.primaryBtnText}>Save Plan</Text>
          </TouchableOpacity>
          {yearlyPlans.length === 0 ? (
            <Text style={s.sectionEmpty}>No yearly plan entries yet.</Text>
          ) : (
            yearlyPlans.map((plan) => (
              <View key={plan.id} style={s.sectionRow}>
                <Text style={s.sectionMonth}>{plan.month}</Text>
                <Text style={s.sectionMeta}>
                  {[plan.subject1, plan.subject2, plan.subject3].filter(Boolean).join(' · ') || 'No subjects'}
                </Text>
                {plan.notes ? <Text style={s.sectionMeta}>{plan.notes}</Text> : null}
              </View>
            ))
          )}
        </View>

        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>Resource Mapping</Text>
          {RESOURCE_MAPPING_TEMPLATE.map((row) => {
            const mapped = resourceMap[row.rowKey];
            return (
              <View key={row.rowKey} style={s.sectionRow}>
                <Text style={s.sectionMonth}>{row.subject}</Text>
                <Text style={s.sectionMeta}>{row.paper} • {row.part}</Text>
                <Text style={s.sectionMeta}>Resource: {mapped?.resource || '—'}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EntryRow({
  entry, onToggle, onRevision,
}: {
  entry: ScheduleEntry;
  onToggle: () => void;
  onRevision: (rev: 1 | 2 | 3) => void;
}) {
  const accent = TYPE_ACCENT[entry.entryType];
  const typeBg = entry.completed ? colors.successSubtle : TYPE_BG[entry.entryType];

  return (
    <View style={[row.wrap, { backgroundColor: typeBg }]}>
      {/* Thick left accent bar */}
      <View style={[row.accentBar, { backgroundColor: accent }]} />

      <View style={row.body}>
        <View style={row.top}>
          <View style={row.info}>
            <Text style={[row.typeLabel, { color: accent }]}>{TYPE_SHORT[entry.entryType]}</Text>
            <Text style={row.subject}>{entry.subject}</Text>
            {entry.syllabus ? <Text style={row.syllabus}>{entry.syllabus}</Text> : null}
            {entry.primarySource ? <Text style={row.source}>{entry.primarySource}</Text> : null}
          </View>

          {/* Completion check */}
          <TouchableOpacity
            style={[row.check, entry.completed && row.checkDone]}
            onPress={onToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {entry.completed && <Text style={row.checkMark}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Revision pills — fully rounded */}
        <View style={row.revRow}>
          {([1, 2, 3] as const).map((rev) => {
            const done = entry[`revision${rev}`];
            return (
              <TouchableOpacity
                key={rev}
                style={[row.revPill, done && row.revPillDone]}
                onPress={() => onRevision(rev)}
              >
                <Text style={[row.revText, done && row.revTextDone]}>R{rev}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },

  weekStrip: { flexGrow: 0 },
  weekContent: { paddingHorizontal: 16, paddingBottom: 4, gap: 4 },
  dayTile: {
    width: 52,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
  },
  dayTileActive: {
    backgroundColor: colors.text,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  dayNameActive: { color: 'rgba(255,255,255,0.55)' },
  dayNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  dayNumActive: { color: colors.surface },
  hasEntriesDot: { width: 4, height: 4, borderRadius: 2 },
  hasEntriesDotActive: { backgroundColor: 'rgba(255,255,255,0.5)' },
  hasEntriesDotInactive: { backgroundColor: colors.accent },

  dateSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginTop: 8,
  },
  dateSummaryText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  countBadge: {
    backgroundColor: colors.accentLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countBadgeText: { fontSize: 12, color: colors.accent, fontWeight: '700' },

  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, gap: 10 },
  empty: { paddingTop: 72, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyHint: { fontSize: 14, color: colors.textMuted },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 8 },
  sectionEmpty: { color: colors.textMuted, fontSize: 13 },
  sectionRow: { borderTopWidth: 1, borderTopColor: colors.divider, paddingVertical: 8 },
  sectionMonth: { color: colors.text, fontSize: 12, fontWeight: '700' },
  sectionMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  primaryBtn: { backgroundColor: colors.text, borderRadius: 10, alignItems: 'center', paddingVertical: 11, marginBottom: 8 },
  primaryBtnText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
});

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  accentBar: {
    width: 5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: { flex: 1, gap: 3 },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  subject: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  syllabus: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  source: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 2,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: colors.surface,
  },
  checkDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkMark: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '800',
  },
  revRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  revPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  revPillDone: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  revText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  revTextDone: {
    color: colors.accent,
  },
});
