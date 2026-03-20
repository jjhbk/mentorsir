import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  visible: boolean;
  value: string;           // "YYYY-MM-DD"
  label?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

function parseDate(iso: string): Date {
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? new Date() : d;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function DatePicker({ visible, value, label = 'Select date', onConfirm, onCancel }: Props) {
  const initial = parseDate(value);
  const [viewYear, setViewYear] = React.useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initial.getMonth());
  const [selected, setSelected] = React.useState(toISO(initial));

  React.useEffect(() => {
    if (visible) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setSelected(toISO(d));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayISO = new Date().toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} style={s.sheet}>
          <SafeAreaView>
            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity onPress={onCancel} style={s.headerBtn}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={s.title}>{label}</Text>
              <TouchableOpacity onPress={() => onConfirm(selected)} style={s.headerBtn}>
                <Text style={s.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Month navigation */}
            <View style={s.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={s.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={s.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day-of-week headers */}
            <View style={s.dayHeaders}>
              {DAYS.map((d) => (
                <Text key={d} style={s.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={s.grid}>
              {cells.map((day, idx) => {
                if (!day) return <View key={idx} style={s.cell} />;
                const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = iso === selected;
                const isToday = iso === todayISO;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[s.cell, isSelected && s.cellSelected, isToday && !isSelected && s.cellToday]}
                    onPress={() => setSelected(iso)}
                  >
                    <Text style={[s.cellText, isSelected && s.cellTextSelected, isToday && !isSelected && s.cellTextToday]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: 16 }} />
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const CELL = 44;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,23,16,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerBtn: { paddingVertical: 4, paddingHorizontal: 4, minWidth: 60 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  cancelText: { fontSize: 15, color: colors.textMuted },
  doneText: { fontSize: 15, color: colors.accent, fontWeight: '700', textAlign: 'right' },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  navArrow: { fontSize: 22, color: colors.text, fontWeight: '300', lineHeight: 26 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },

  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  dayHeader: {
    width: CELL,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  cell: {
    width: CELL,
    height: CELL,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL / 2,
  },
  cellSelected: {
    backgroundColor: colors.accent,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  cellText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '400',
  },
  cellTextSelected: {
    color: '#FFF8F0',
    fontWeight: '700',
  },
  cellTextToday: {
    color: colors.accent,
    fontWeight: '700',
  },
});
