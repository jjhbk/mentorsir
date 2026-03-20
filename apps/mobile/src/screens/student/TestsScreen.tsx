import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { useTestsStore } from '../../store/useTestsStore';
import { colors } from '../../theme/colors';
import { MistakeBreakdown } from '../../types';
import DatePicker from '../../components/DatePicker';

const MISTAKE_KEYS: (keyof MistakeBreakdown)[] = [
  'conceptual', 'recall', 'reading', 'elimination',
  'decisionMaking', 'silly', 'psychological', 'patternMisjudgment',
];
const MISTAKE_LABELS: Record<keyof MistakeBreakdown, string> = {
  conceptual: 'Conceptual',
  recall: 'Recall / Revision',
  reading: 'Question Reading',
  elimination: 'Elimination',
  decisionMaking: 'Decision-Making',
  silly: 'Silly / Careless',
  psychological: 'Psychological',
  patternMisjudgment: 'Pattern Misjudgment',
};
const EMPTY: MistakeBreakdown = {
  conceptual: 0, recall: 0, reading: 0, elimination: 0,
  decisionMaking: 0, silly: 0, psychological: 0, patternMisjudgment: 0,
};
const todayISO = new Date().toISOString().slice(0, 10);

function scoreColor(pct: number) {
  if (pct >= 75) return colors.success;
  if (pct >= 60) return colors.warning;
  return colors.danger;
}
function scoreBg(pct: number) {
  if (pct >= 75) return colors.successLight;
  if (pct >= 60) return colors.warningLight;
  return colors.dangerLight;
}

export default function TestsScreen() {
  const { tests, loading, fetchTests, addTest, deleteTest } = useTestsStore();
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    testName: '', date: todayISO, score: '', totalQuestions: '100',
    mistakes: { ...EMPTY },
  });

  useEffect(() => { fetchTests(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setMistake = (k: keyof MistakeBreakdown, delta: number) =>
    setForm((f) => ({
      ...f,
      mistakes: { ...f.mistakes, [k]: Math.max(0, f.mistakes[k] + delta) },
    }));

  const handleAdd = async () => {
    if (!form.testName.trim()) { Alert.alert('Enter a test name'); return; }
    await addTest({
      testName: form.testName.trim(),
      date: form.date,
      score: Number(form.score) || 0,
      totalQuestions: Number(form.totalQuestions) || 100,
      mistakes: form.mistakes,
    });
    setShowModal(false);
    setForm({ testName: '', date: todayISO, score: '', totalQuestions: '100', mistakes: { ...EMPTY } });
  };

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Tests</Text>
          <Text style={s.sub}>{tests.length} recorded</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={s.addBtnText}>+ Add result</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {tests.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No tests yet</Text>
            <Text style={s.emptyHint}>Add your first test to begin tracking mistake patterns.</Text>
          </View>
        ) : (
          tests.map((test) => {
            const pct = Math.round((test.score / test.totalQuestions) * 100);
            const totalMistakes = Object.values(test.mistakes).reduce((a, b) => a + b, 0);
            const topKey = [...MISTAKE_KEYS].sort(
              (a, b) => test.mistakes[b] - test.mistakes[a]
            )[0];
            return (
              <TouchableOpacity
                key={test.id}
                style={card.wrap}
                activeOpacity={0.95}
                onLongPress={() =>
                  Alert.alert('Delete?', test.testName, [
                    { text: 'Cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteTest(test.id) },
                  ])
                }
              >
                <View style={card.row}>
                  <View style={card.left}>
                    <Text style={card.name}>{test.testName}</Text>
                    <Text style={card.date}>{test.date}</Text>
                    {totalMistakes > 0 && (
                      <Text style={card.topMistake}>
                        {totalMistakes} mistakes · top: {MISTAKE_LABELS[topKey].toLowerCase()}
                      </Text>
                    )}
                  </View>
                  {/* Score badge — color by performance */}
                  <View style={[card.scoreBadge, { backgroundColor: scoreBg(pct) }]}>
                    <Text style={[card.scoreNum, { color: scoreColor(pct) }]}>{test.score}</Text>
                    <Text style={[card.scoreTotal, { color: scoreColor(pct) + 'BB' }]}>/{test.totalQuestions}</Text>
                    <Text style={[card.scorePct, { color: scoreColor(pct) }]}>{pct}%</Text>
                  </View>
                </View>

                {/* Mistake bars */}
                {totalMistakes > 0 && (
                  <View style={card.barsWrap}>
                    {MISTAKE_KEYS.filter((k) => test.mistakes[k] > 0).map((k) => (
                      <View key={k} style={card.barRow}>
                        <Text style={card.barKey}>{MISTAKE_LABELS[k].slice(0, 13)}</Text>
                        <View style={card.barTrack}>
                          <View
                            style={[
                              card.barFill,
                              { width: `${(test.mistakes[k] / totalMistakes) * 100}%` },
                            ]}
                          />
                        </View>
                        <Text style={card.barNum}>{test.mistakes[k]}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add test modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <DatePicker
            visible={showDatePicker}
            value={form.date}
            label="Test date"
            onConfirm={(d) => { setForm((f) => ({ ...f, date: d })); setShowDatePicker(false); }}
            onCancel={() => setShowDatePicker(false)}
          />
          <ScrollView contentContainerStyle={m.scroll} showsVerticalScrollIndicator={false}>
            <View style={m.header}>
              <Text style={m.title}>New test result</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={m.closeBtn}>
                <Text style={m.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={m.fieldLabel}>Test name</Text>
            <TextInput
              style={m.input}
              value={form.testName}
              onChangeText={(v) => setForm((f) => ({ ...f, testName: v }))}
              placeholder="e.g. PYQ Mock #3"
              placeholderTextColor={colors.textFaint}
              autoFocus
            />

            <Text style={m.fieldLabel}>Date</Text>
            <TouchableOpacity style={m.dateField} onPress={() => setShowDatePicker(true)} activeOpacity={0.75}>
              <Text style={m.dateFieldText}>{form.date}</Text>
              <Text style={m.dateFieldIcon}>📅</Text>
            </TouchableOpacity>

            <View style={m.row}>
              <View style={m.flex1}>
                <Text style={m.fieldLabel}>Score</Text>
                <TextInput
                  style={m.input}
                  value={form.score}
                  onChangeText={(v) => setForm((f) => ({ ...f, score: v }))}
                  keyboardType="numeric"
                  placeholder="78"
                  placeholderTextColor={colors.textFaint}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={m.flex1}>
                <Text style={m.fieldLabel}>Total questions</Text>
                <TextInput
                  style={m.input}
                  value={form.totalQuestions}
                  onChangeText={(v) => setForm((f) => ({ ...f, totalQuestions: v }))}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor={colors.textFaint}
                />
              </View>
            </View>

            <View style={m.sectionHeader}>
              <View style={m.sectionRule} />
              <Text style={m.sectionLabel}>Mistake breakdown</Text>
              <View style={m.sectionRule} />
            </View>

            {MISTAKE_KEYS.map((k) => (
              <View key={k} style={m.mistakeRow}>
                <Text style={m.mistakeLabel}>{MISTAKE_LABELS[k]}</Text>
                <View style={m.mistakeCtrl}>
                  <TouchableOpacity
                    style={m.stepBtn}
                    onPress={() => setMistake(k, -1)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={m.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={[m.mistakeVal, form.mistakes[k] > 0 && m.mistakeValActive]}>
                    {form.mistakes[k]}
                  </Text>
                  <TouchableOpacity
                    style={m.stepBtn}
                    onPress={() => setMistake(k, 1)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={m.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={m.saveBtn} onPress={handleAdd} activeOpacity={0.8}>
              <Text style={m.saveBtnText}>Save result</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  addBtn: {
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: colors.accent, borderRadius: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF8F0' },
  list: { paddingHorizontal: 20, paddingBottom: 48, gap: 12 },
  empty: { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyHint: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 32 },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  date: { fontSize: 12, color: colors.textMuted },
  topMistake: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  scoreBadge: {
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 12,
    minWidth: 72,
  },
  scoreNum: { fontSize: 32, fontWeight: '800', letterSpacing: -1.5, lineHeight: 36 },
  scoreTotal: { fontSize: 13, fontWeight: '500', marginTop: -2 },
  scorePct: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  barsWrap: { gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barKey: { fontSize: 11, color: colors.textMuted, width: 82 },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3 },
  barFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  barNum: { fontSize: 11, color: colors.textMuted, width: 16, textAlign: 'right' },
});

const m = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 48 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 28,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  close: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  fieldLabel: {
    fontSize: 12, color: colors.textMuted, fontWeight: '600',
    marginBottom: 6, letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.text, marginBottom: 14,
  },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 8, marginBottom: 4,
  },
  sectionRule: { flex: 1, height: 1, backgroundColor: colors.divider },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textFaint,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  mistakeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  mistakeLabel: { fontSize: 14, color: colors.text, flex: 1 },
  mistakeCtrl: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontSize: 18, color: colors.text, fontWeight: '300', lineHeight: 22 },
  mistakeVal: {
    fontSize: 16, fontWeight: '700', color: colors.textMuted,
    width: 24, textAlign: 'center',
  },
  mistakeValActive: { color: colors.accent },
  dateField: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
  },
  dateFieldText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  dateFieldIcon: { fontSize: 16 },
  saveBtn: {
    backgroundColor: colors.accent, borderRadius: 10,
    paddingVertical: 17, alignItems: 'center', marginTop: 28,
  },
  saveBtnText: { color: '#FFF8F0', fontSize: 15, fontWeight: '700' },
});
