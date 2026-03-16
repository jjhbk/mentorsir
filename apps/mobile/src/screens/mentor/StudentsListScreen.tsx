import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useStudentsStore } from '../../store/useStudentsStore';
import { colors } from '../../theme/colors';
import { MentorStudentsStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MentorStudentsStackParamList, 'StudentsList'>;

const todayISO = new Date().toISOString().slice(0, 10);

function statusOf(log: { date: string; studyHours: number } | null) {
  if (!log) return 'inactive';
  if (log.date === todayISO && log.studyHours >= 6) return 'on-track';
  if (log.date === todayISO) return 'at-risk';
  return 'inactive';
}

const STATUS_COLOR = {
  'on-track': colors.statusOnTrack,
  'at-risk': colors.statusAtRisk,
  inactive: colors.statusInactive,
};

const STATUS_LABEL = {
  'on-track': 'On track',
  'at-risk': 'At risk',
  inactive: 'Inactive',
};

export default function StudentsListScreen() {
  const navigation = useNavigation<Nav>();
  const { students, loading, fetchStudents } = useStudentsStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStudents(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = students.filter(
    (s) => !search || s.name?.toLowerCase().includes(search.toLowerCase())
  );

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
        <Text style={s.title}>Students</Text>
        <Text style={s.sub}>{students.length} enrolled</Text>
      </View>

      <View style={s.searchWrap}>
        <TextInput
          style={s.search}
          placeholder="Search…"
          placeholderTextColor={colors.textFaint}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item: student }) => {
          const status = statusOf(student.latestLog);
          const color = STATUS_COLOR[status];
          return (
            <TouchableOpacity
              style={s.row}
              onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
            >
              <View style={s.initial}>
                <Text style={s.initialText}>{(student.name?.[0] ?? 'S').toUpperCase()}</Text>
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowName}>{student.name ?? 'Unknown'}</Text>
                <Text style={s.rowDetail}>
                  {student.latestLog
                    ? `${student.latestLog.date} · ${student.latestLog.studyHours}h`
                    : 'No activity'}
                </Text>
              </View>
              <View style={s.statusWrap}>
                <View style={[s.statusDot, { backgroundColor: color }]} />
                <Text style={[s.statusLabel, { color }]}>{STATUS_LABEL[status]}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>No students found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  searchWrap: { paddingHorizontal: 24, paddingVertical: 14 },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  list: { paddingHorizontal: 24, paddingBottom: 48 },
  sep: { height: 1, backgroundColor: colors.divider },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  initial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: { fontSize: 16, fontWeight: '800', color: colors.textMuted },
  rowInfo: { flex: 1, gap: 3 },
  rowName: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowDetail: { fontSize: 12, color: colors.textMuted },
  statusWrap: { alignItems: 'flex-end', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 15, color: colors.textMuted },
});
