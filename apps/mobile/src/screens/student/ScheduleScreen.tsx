import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useScheduleStore } from '../../store/useScheduleStore';
import { colors } from '../../theme/colors';
import { ScheduleEntry } from '../../types';

const todayISO = new Date().toISOString().slice(0, 10);

const TYPE_ACCENT: Record<ScheduleEntry['entryType'], string> = {
  study: colors.accent,
  'ca-test': colors.warning,
  'sectional-test': colors.danger,
  'mentor-connect': colors.success,
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
  const [selectedDate, setSelectedDate] = useState(todayISO);

  useEffect(() => { fetchEntries(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              <View style={[s.hasEntriesDot, hasEntries && (active ? s.hasEntriesDotActive : s.hasEntriesDotInactive)]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected date summary */}
      <View style={s.dateSummary}>
        <Text style={s.dateSummaryText}>
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text style={s.dateSummaryCount}>
          {dayEntries.length} {dayEntries.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Entries */}
      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {dayEntries.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>Rest day</Text>
            <Text style={s.emptyHint}>Nothing scheduled for today.</Text>
          </View>
        ) : (
          dayEntries.map((entry, idx) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              last={idx === dayEntries.length - 1}
              onToggle={() => toggleCompleted(entry.id)}
              onRevision={(rev) => toggleRevision(entry.id, rev)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EntryRow({
  entry, last, onToggle, onRevision,
}: {
  entry: ScheduleEntry;
  last: boolean;
  onToggle: () => void;
  onRevision: (rev: 1 | 2 | 3) => void;
}) {
  const accent = TYPE_ACCENT[entry.entryType];
  return (
    <View style={[row.wrap, !last && row.bordered]}>
      {/* Left accent bar */}
      <View style={[row.accentBar, { backgroundColor: accent }]} />

      <View style={row.body}>
        <View style={row.top}>
          <View style={row.info}>
            <Text style={row.typeLabel}>{TYPE_SHORT[entry.entryType]}</Text>
            <Text style={row.subject}>{entry.subject}</Text>
            {entry.syllabus ? <Text style={row.syllabus}>{entry.syllabus}</Text> : null}
            {entry.primarySource ? <Text style={row.source}>{entry.primarySource}</Text> : null}
          </View>

          {/* Completion check */}
          <TouchableOpacity style={[row.check, entry.completed && row.checkDone]} onPress={onToggle}>
            {entry.completed && <Text style={row.checkMark}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Revision pills */}
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
  weekContent: { paddingHorizontal: 20, paddingBottom: 4, gap: 6 },
  dayTile: {
    width: 52,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
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
  dayNameActive: { color: 'rgba(255,255,255,0.6)' },
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
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginTop: 8,
  },
  dateSummaryText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  dateSummaryCount: { fontSize: 13, color: colors.textMuted },

  list: { paddingBottom: 48 },
  empty: { paddingTop: 72, alignItems: 'center', gap: 6 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyHint: { fontSize: 14, color: colors.textMuted },
});

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bordered: {},
  accentBar: {
    width: 3,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
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
    color: colors.textMuted,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
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
    gap: 8,
    alignItems: 'center',
  },
  revPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
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
