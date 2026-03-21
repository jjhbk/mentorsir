import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, Alert, TextInput, Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useLogsStore } from '../../store/useLogsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { DailyLog } from '../../types';
import TimePicker from '../../components/TimePicker';

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
  const { profile, updateProfile, signOut } = useAuthStore();
  const { fetchLogs, getLog, upsertLog } = useLogsStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timePicker, setTimePicker] = useState<{ field: 'sleepTime' | 'wakeTime' } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(profile?.name ?? '');
  const [profileMobile, setProfileMobile] = useState(profile?.mobile ?? '');
  const [profileTelegram, setProfileTelegram] = useState(profile?.telegramId ?? '');

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

  useEffect(() => {
    setProfileName(profile?.name ?? '');
    setProfileMobile(profile?.mobile ?? '');
    setProfileTelegram(profile?.telegramId ?? '');
  }, [profile?.name, profile?.mobile, profile?.telegramId]);

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await upsertLog({ date: todayISO, ...form });
    setSaving(false);
    Alert.alert('Saved', 'Log updated.');
  };

  const onSaveProfile = async () => {
    const result = await updateProfile({
      name: profileName,
      mobile: profileMobile,
      telegramId: profileTelegram,
    });
    if (!result.ok) {
      Alert.alert('Unable to save profile', result.error ?? 'Try again.');
      return;
    }
    setShowProfileModal(false);
  };

  const onPressSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setShowProfileModal(false);
          await signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const firstName = profile?.name?.split(' ')[0] ?? 'Scholar';

  // Segment config with semantic colors
  const SEGMENTS: { key: DailyLog['taskCompleted']; label: string; bg: string; fg: string }[] = [
    { key: 'yes',     label: 'Yes',     bg: colors.successLight, fg: colors.success },
    { key: 'partial', label: 'Partial', bg: colors.accentLight,  fg: colors.accentDark },
    { key: 'no',      label: 'No',      bg: colors.dangerLight,  fg: colors.danger },
  ];

  return (
    <SafeAreaView style={s.root}>
      {/* Time pickers */}
      <TimePicker
        visible={timePicker?.field === 'sleepTime'}
        value={form.sleepTime || '10:30 PM'}
        label="Slept at"
        onConfirm={(v) => { set('sleepTime', v); setTimePicker(null); }}
        onCancel={() => setTimePicker(null)}
      />
      <TimePicker
        visible={timePicker?.field === 'wakeTime'}
        value={form.wakeTime || '06:00 AM'}
        label="Woke at"
        onConfirm={(v) => { set('wakeTime', v); setTimePicker(null); }}
        onCancel={() => setTimePicker(null)}
      />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Modal visible={showProfileModal} animationType="slide" transparent onRequestClose={() => setShowProfileModal(false)}>
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setShowProfileModal(false)} style={s.modalCloseBtn}>
                  <Icon name="x" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={s.modalInput}
                placeholder="Name"
                placeholderTextColor={colors.textFaint}
                value={profileName}
                onChangeText={setProfileName}
              />
              <TextInput
                style={s.modalInput}
                placeholder="Mobile number"
                placeholderTextColor={colors.textFaint}
                value={profileMobile}
                onChangeText={setProfileMobile}
                keyboardType="phone-pad"
              />
              <TextInput
                style={s.modalInput}
                placeholder="Telegram ID"
                placeholderTextColor={colors.textFaint}
                value={profileTelegram}
                onChangeText={setProfileTelegram}
              />

              <TouchableOpacity style={s.modalPrimaryBtn} onPress={onSaveProfile}>
                <Text style={s.modalPrimaryBtnText}>Save Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSignOutBtn} onPress={onPressSignOut}>
                <Text style={s.modalSignOutBtnText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => setShowProfileModal(true)} activeOpacity={0.75}>
              <Text style={s.greetingText}>{greeting()}, {firstName}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.profileIconBtn}
              onPress={() => setShowProfileModal(true)}
              accessibilityLabel="Open profile settings"
            >
              <Icon name="user" size={15} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={s.dateText}>{formatDateLong(todayISO)}</Text>
        </View>

        {/* Hero numbers — study + sleep */}
        <View style={s.heroRow}>
          <HeroStepper
            label="Study"
            unit="hrs"
            value={form.studyHours}
            step={0.5}
            color={colors.accent}
            onDecrement={() => set('studyHours', Math.max(0, +(form.studyHours - 0.5).toFixed(1)))}
            onIncrement={() => set('studyHours', +(form.studyHours + 0.5).toFixed(1))}
          />
          <View style={s.heroDivider} />
          <HeroStepper
            label="Sleep"
            unit="hrs"
            value={form.sleepHours}
            step={0.5}
            color={colors.textMuted}
            onDecrement={() => set('sleepHours', Math.max(0, +(form.sleepHours - 0.5).toFixed(1)))}
            onIncrement={() => set('sleepHours', +(form.sleepHours + 0.5).toFixed(1))}
          />
        </View>

        {/* Sleep schedule */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Sleep schedule</Text>
          <View style={s.row}>
            <View style={s.flex1}>
              <Text style={s.fieldLabel}>Slept at</Text>
              <TouchableOpacity
                style={s.timeField}
                onPress={() => setTimePicker({ field: 'sleepTime' })}
                activeOpacity={0.75}
              >
                <Text style={[s.timeFieldText, !form.sleepTime && s.timeFieldPlaceholder]}>
                  {form.sleepTime || '11:30 PM'}
                </Text>
                <Text style={s.timeFieldIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
            <View style={s.gap} />
            <View style={s.flex1}>
              <Text style={s.fieldLabel}>Woke at</Text>
              <TouchableOpacity
                style={s.timeField}
                onPress={() => setTimePicker({ field: 'wakeTime' })}
                activeOpacity={0.75}
              >
                <Text style={[s.timeFieldText, !form.wakeTime && s.timeFieldPlaceholder]}>
                  {form.wakeTime || '6:00 AM'}
                </Text>
                <Text style={s.timeFieldIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Wellness */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Wellness</Text>
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

        {/* Task completion — semantic colors */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Tasks completed</Text>
          <View style={s.segmentRow}>
            {SEGMENTS.map((seg) => {
              const active = form.taskCompleted === seg.key;
              return (
                <TouchableOpacity
                  key={seg.key}
                  style={[
                    s.segment,
                    active && { backgroundColor: seg.bg, borderColor: seg.fg + '44' },
                  ]}
                  onPress={() => set('taskCompleted', seg.key)}
                >
                  {active && <View style={[s.segmentDot, { backgroundColor: seg.fg }]} />}
                  <Text style={[s.segmentText, active && { color: seg.fg, fontWeight: '700' }]}>
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Mentor connect */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Mentor connect</Text>
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
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFF8F0" size="small" />
          ) : (
            <Text style={s.saveBtnText}>Save log</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function HeroStepper({
  label, unit, value, color, onDecrement, onIncrement,
}: {
  label: string; unit: string; value: number; color: string;
  step: number; onDecrement: () => void; onIncrement: () => void;
}) {
  return (
    <View style={hero.wrap}>
      <TouchableOpacity style={hero.btn} onPress={onDecrement} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={hero.btnText}>−</Text>
      </TouchableOpacity>
      <View style={hero.mid}>
        <Text style={[hero.value, { color }]}>{value}</Text>
        <Text style={hero.unitText}>{unit}</Text>
        <Text style={hero.label}>{label}</Text>
      </View>
      <TouchableOpacity style={hero.btn} onPress={onIncrement} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
        <TouchableOpacity onPress={onDecrement} style={s.stepBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Text style={s.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.compactValue}>{value}<Text style={s.compactUnit}> {unit}</Text></Text>
        <TouchableOpacity onPress={onIncrement} style={s.stepBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: '300',
    lineHeight: 26,
  },
  mid: { alignItems: 'center' },
  value: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 56,
  },
  unitText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  label: {
    fontSize: 10,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    marginTop: 4,
  },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  header: {
    paddingTop: 32,
    paddingBottom: 20,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  profileIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 18 },
  modalCard: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
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
  modalPrimaryBtn: {
    backgroundColor: colors.text,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
  },
  modalPrimaryBtnText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  modalSignOutBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.dangerLight,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.dangerSubtle,
  },
  modalSignOutBtnText: { color: colors.danger, fontWeight: '700', fontSize: 12 },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 14,
  },

  row: { flexDirection: 'row', paddingBottom: 12 },
  flex1: { flex: 1 },
  gap: { width: 12 },

  fieldLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
    fontWeight: '500',
  },
  timeField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeFieldText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  timeFieldPlaceholder: {
    color: colors.textFaint,
    fontWeight: '400',
  },
  timeFieldIcon: {
    fontSize: 16,
  },

  divider: { height: 1, backgroundColor: colors.divider },
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
    gap: 10,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
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
    gap: 8,
    paddingBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  segmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },

  // Toggle — green when on
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 3,
  },
  toggleOn: {
    backgroundColor: colors.success,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },

  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.shadowMd,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: {
    color: '#FFF8F0',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
