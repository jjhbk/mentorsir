import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, SafeAreaView, Alert, Platform,
} from 'react-native';
import { useLogsStore } from '../../store/useLogsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { DailyLog } from '../../types';

const todayISO = new Date().toISOString().slice(0, 10);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDateLong(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function TodayScreen() {
  const { profile } = useAuthStore();
  const { fetchLogs, getLog, upsertLog } = useLogsStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const existing = getLog(todayISO);
  const [form, setForm] = useState<Omit<DailyLog, 'date'>>({
    studyHours: 0,
    sleepHours: 0,
    meditationMinutes: 0,
    sleepTime: '',
    wakeTime: '',
    taskCompleted: 'no',
    afternoonNapMinutes: 0,
    hadMentorDiscussion: false,
    relaxationActivity: '',
  });

  useEffect(() => {
    fetchLogs().then(() => {
      const log = getLog(todayISO);
      if (log) setForm({ ...log });
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await upsertLog({ date: todayISO, ...form });
    setSaving(false);
    Alert.alert('Saved', 'Log updated.');
  };

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const firstName = profile?.name?.split(' ')[0] ?? 'Scholar';

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.greetingText}>{greeting()}, {firstName}</Text>
          <Text style={s.dateText}>{formatDateLong(todayISO)}</Text>
        </View>

        {/* Hero numbers — study + sleep */}
        <View style={s.heroRow}>
          <HeroStepper
            label="Study hours"
            value={form.studyHours}
            step={0.5}
            onDecrement={() => set('studyHours', Math.max(0, +(form.studyHours - 0.5).toFixed(1)))}
            onIncrement={() => set('studyHours', +(form.studyHours + 0.5).toFixed(1))}
          />
          <View style={s.heroDivider} />
          <HeroStepper
            label="Sleep hours"
            value={form.sleepHours}
            step={0.5}
            onDecrement={() => set('sleepHours', Math.max(0, +(form.sleepHours - 0.5).toFixed(1)))}
            onIncrement={() => set('sleepHours', +(form.sleepHours + 0.5).toFixed(1))}
          />
        </View>

        {/* Time fields */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Sleep schedule</Text>
          <View style={s.row}>
            <View style={s.flex1}>
              <Text style={s.fieldLabel}>Slept at</Text>
              <TextInput
                style={s.input}
                value={form.sleepTime}
                onChangeText={(v) => set('sleepTime', v)}
                placeholder="11:30 PM"
                placeholderTextColor={colors.textFaint}
              />
            </View>
            <View style={s.gap} />
            <View style={s.flex1}>
              <Text style={s.fieldLabel}>Woke at</Text>
              <TextInput
                style={s.input}
                value={form.wakeTime}
                onChangeText={(v) => set('wakeTime', v)}
                placeholder="6:00 AM"
                placeholderTextColor={colors.textFaint}
              />
            </View>
          </View>
        </View>

        {/* Compact metrics */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Wellness</Text>
          <CompactStepper
            label="Meditation"
            value={form.meditationMinutes}
            unit="min"
            step={5}
            onDecrement={() => set('meditationMinutes', Math.max(0, form.meditationMinutes - 5))}
            onIncrement={() => set('meditationMinutes', form.meditationMinutes + 5)}
          />
          <View style={s.divider} />
          <CompactStepper
            label="Afternoon nap"
            value={form.afternoonNapMinutes}
            unit="min"
            step={5}
            onDecrement={() => set('afternoonNapMinutes', Math.max(0, form.afternoonNapMinutes - 5))}
            onIncrement={() => set('afternoonNapMinutes', form.afternoonNapMinutes + 5)}
          />
          <View style={s.divider} />
          <View style={s.compactRow}>
            <Text style={s.compactLabel}>Relaxation</Text>
            <TextInput
              style={s.compactInput}
              value={form.relaxationActivity}
              onChangeText={(v) => set('relaxationActivity', v)}
              placeholder="Walk, reading…"
              placeholderTextColor={colors.textFaint}
              textAlign="right"
            />
          </View>
        </View>

        {/* Task completion */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Tasks completed</Text>
          <View style={s.segmentRow}>
            {(['yes', 'partial', 'no'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.segment, form.taskCompleted === opt && s.segmentActive]}
                onPress={() => set('taskCompleted', opt)}
              >
                <Text style={[s.segmentText, form.taskCompleted === opt && s.segmentTextActive]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mentor discussion toggle */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Mentor connect</Text>
          <TouchableOpacity
            style={s.compactRow}
            onPress={() => set('hadMentorDiscussion', !form.hadMentorDiscussion)}
          >
            <Text style={s.compactLabel}>1-on-1 discussion today</Text>
            <View style={[s.toggle, form.hadMentorDiscussion && s.toggleOn]}>
              <View style={[s.thumb, form.hadMentorDiscussion && s.thumbOn]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[s.saveBtn, saving && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <Text style={s.saveBtnText}>Save log</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HeroStepper({
  label, value, onDecrement, onIncrement,
}: {
  label: string; value: number;
  step: number; onDecrement: () => void; onIncrement: () => void;
}) {
  return (
    <View style={hero.wrap}>
      <TouchableOpacity style={hero.btn} onPress={onDecrement}>
        <Text style={hero.btnText}>−</Text>
      </TouchableOpacity>
      <View style={hero.mid}>
        <Text style={hero.value}>{value}</Text>
        <Text style={hero.label}>{label}</Text>
      </View>
      <TouchableOpacity style={hero.btn} onPress={onIncrement}>
        <Text style={hero.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function CompactStepper({
  label, value, unit, onDecrement, onIncrement,
}: {
  label: string; value: number; unit: string;
  step: number; onDecrement: () => void; onIncrement: () => void;
}) {
  return (
    <View style={s.compactRow}>
      <Text style={s.compactLabel}>{label}</Text>
      <View style={s.compactControls}>
        <TouchableOpacity onPress={onDecrement} style={s.stepBtn}>
          <Text style={s.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.compactValue}>{value}<Text style={s.compactUnit}> {unit}</Text></Text>
        <TouchableOpacity onPress={onIncrement} style={s.stepBtn}>
          <Text style={s.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 28,
    color: colors.textMuted,
    fontWeight: '300',
    lineHeight: 32,
  },
  mid: {
    alignItems: 'center',
  },
  value: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -2,
    lineHeight: 56,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    marginTop: 4,
  },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 24, paddingBottom: 48 },

  header: {
    paddingTop: 32,
    paddingBottom: 28,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroDivider: {
    width: 1,
    height: 56,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },

  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },

  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  gap: { width: 12 },

  fieldLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  compactLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '400',
  },
  compactInput: {
    fontSize: 15,
    color: colors.textMuted,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 52,
    textAlign: 'center',
  },
  compactUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '300',
  },

  segmentRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segmentActive: {
    backgroundColor: colors.text,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },

  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 3,
  },
  toggleOn: {
    backgroundColor: colors.text,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },

  saveBtn: {
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
