import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, SafeAreaView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useStudentsStore, StudentSummary } from '../../store/useStudentsStore';
import { colors } from '../../theme/colors';
import { MentorStudentsStackParamList } from '../../types';

type Route = RouteProp<MentorStudentsStackParamList, 'StudentDetail'>;

const ACADEMIC_SUBJECTS = ['Polity', 'Economy', 'History', 'Geography', 'Environment', 'S&T', 'Current Affairs', 'CSAT'];
const STRONG_TRAITS = ['Consistent', 'Analytical', 'Self-motivated', 'Disciplined', 'Calm under pressure', 'Quick learner', 'Detail-oriented'];
const WEAK_TRAITS = ['Procrastination', 'Overthinking', 'Exam anxiety', 'Poor revision', 'Distracted', 'Inconsistent', 'Guessing tendency'];

type AuditKey = keyof NonNullable<StudentSummary['audit']>;

export default function StudentDetailScreen() {
  const route = useRoute<Route>();
  const { students, updateAudit } = useStudentsStore();
  const student = students.find((s) => s.id === route.params.studentId);

  const [audit, setAudit] = useState<NonNullable<StudentSummary['audit']>>(
    student?.audit ?? {
      strongAcademicSubjects: [],
      weakAcademicSubjects: [],
      strongPersonalityTraits: [],
      weakPersonalityTraits: [],
    }
  );
  const [saving, setSaving] = useState(false);

  if (!student) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted }}>Student not found</Text>
      </SafeAreaView>
    );
  }

  const toggle = (key: AuditKey, value: string) =>
    setAudit((a) => ({
      ...a,
      [key]: a[key].includes(value)
        ? a[key].filter((v) => v !== value)
        : [...a[key], value],
    }));

  const handleSave = async () => {
    setSaving(true);
    await updateAudit(student.id, audit);
    setSaving(false);
    Alert.alert('Saved', 'Audit updated.');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Student identity */}
      <View style={s.nameRow}>
        <View style={s.initial}>
          <Text style={s.initialText}>{(student.name?.[0] ?? 'S').toUpperCase()}</Text>
        </View>
        <View>
          <Text style={s.name}>{student.name ?? 'Unknown'}</Text>
          {student.mobile && <Text style={s.mobile}>{student.mobile}</Text>}
        </View>
      </View>

      {/* Latest log data */}
      {student.latestLog && (
        <>
          <View style={s.divider} />
          <View style={s.section}>
            <Text style={s.sectionLabel}>Latest log</Text>
            <View style={s.logRow}>
              <LogStat value={student.latestLog.date} label="date" />
              <LogStat value={`${student.latestLog.studyHours}h`} label="study" />
              <LogStat value={student.latestLog.taskCompleted} label="tasks" />
            </View>
          </View>
        </>
      )}

      <View style={s.divider} />

      {/* Academic audit */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Academic audit</Text>
        <ChipGroup
          title="Strong subjects"
          options={ACADEMIC_SUBJECTS}
          selected={audit.strongAcademicSubjects}
          onToggle={(v) => toggle('strongAcademicSubjects', v)}
          color={colors.success}
        />
        <ChipGroup
          title="Needs improvement"
          options={ACADEMIC_SUBJECTS}
          selected={audit.weakAcademicSubjects}
          onToggle={(v) => toggle('weakAcademicSubjects', v)}
          color={colors.danger}
        />
      </View>

      <View style={s.divider} />

      {/* Personality audit */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Personality audit</Text>
        <ChipGroup
          title="Strong traits"
          options={STRONG_TRAITS}
          selected={audit.strongPersonalityTraits}
          onToggle={(v) => toggle('strongPersonalityTraits', v)}
          color={colors.success}
        />
        <ChipGroup
          title="Traits to develop"
          options={WEAK_TRAITS}
          selected={audit.weakPersonalityTraits}
          onToggle={(v) => toggle('weakPersonalityTraits', v)}
          color={colors.warning}
        />
      </View>

      <TouchableOpacity
        style={[s.saveBtn, saving && s.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save audit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LogStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={ls.wrap}>
      <Text style={ls.value}>{value}</Text>
      <Text style={ls.label}>{label}</Text>
    </View>
  );
}

function ChipGroup({
  title, options, selected, onToggle, color,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  color: string;
}) {
  return (
    <View style={cg.wrap}>
      <Text style={cg.title}>{title}</Text>
      <View style={cg.chips}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[cg.chip, active && { borderColor: color, backgroundColor: color + '15' }]}
              onPress={() => onToggle(opt)}
            >
              <Text style={[cg.chipText, active && { color }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 24 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 24 },
  initial: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: { fontSize: 22, fontWeight: '800', color: colors.surface },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  mobile: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 4 },
  section: { paddingVertical: 24, gap: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  logRow: { flexDirection: 'row', gap: 0 },
  saveBtn: {
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
});

const ls = StyleSheet.create({
  wrap: { flex: 1, gap: 4 },
  value: { fontSize: 18, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  label: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600' },
});

const cg = StyleSheet.create({
  wrap: { gap: 10 },
  title: { fontSize: 13, fontWeight: '600', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
});
