import React, { useRef, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';

const ITEM_H = 48;
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

interface Props {
  visible: boolean;
  value: string;           // "10:30 PM"
  label?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

function parseTime(val: string): { h: string; m: string; ampm: 'AM' | 'PM' } {
  const match = val.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (match) {
    const parsedMinute = parseInt(match[2], 10);
    const normalizedMinute = Math.max(0, Math.min(55, Math.round(parsedMinute / 5) * 5));
    return {
      h: String(parseInt(match[1], 10)).padStart(2, '0'),
      m: String(normalizedMinute).padStart(2, '0'),
      ampm: match[3].toUpperCase() as 'AM' | 'PM',
    };
  }
  return { h: '10', m: '00', ampm: 'PM' };
}

export default function TimePicker({ visible, value, label = 'Select time', onConfirm, onCancel }: Props) {
  const parsed = parseTime(value);
  const [selH, setSelH] = React.useState(parsed.h);
  const [selM, setSelM] = React.useState(parsed.m);
  const [ampm, setAmpm] = React.useState<'AM' | 'PM'>(parsed.ampm);

  const hRef = useRef<ScrollView>(null);
  const mRef = useRef<ScrollView>(null);

  // Reset to current value each time modal opens
  useEffect(() => {
    if (visible) {
      const p = parseTime(value);
      setSelH(p.h);
      setSelM(p.m);
      setAmpm(p.ampm);
      setTimeout(() => {
        const hIdx = HOURS.indexOf(p.h);
        const mIdx = MINUTES.indexOf(p.m);
        hRef.current?.scrollTo({ y: hIdx * ITEM_H, animated: false });
        mRef.current?.scrollTo({ y: mIdx * ITEM_H, animated: false });
      }, 50);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    onConfirm(`${selH}:${selM} ${ampm}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onCancel} />
        <View style={s.sheet}>
          <SafeAreaView>
            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity onPress={onCancel} style={s.headerBtn}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={s.title}>{label}</Text>
              <TouchableOpacity onPress={handleConfirm} style={s.headerBtn}>
                <Text style={s.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Pickers */}
            <View style={s.pickerRow}>

              {/* Hour */}
              <View style={s.wheelWrap}>
                <View style={s.selectionBar} pointerEvents="none" />
                <ScrollView
                  ref={hRef}
                  style={s.wheel}
                  contentContainerStyle={s.wheelContent}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_H}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
                    setSelH(HOURS[Math.min(idx, HOURS.length - 1)]);
                  }}
                >
                  {/* Padding top/bottom so selected item centers */}
                  <View style={{ height: ITEM_H }} />
                  {HOURS.map((h) => (
                    <View key={h} style={s.wheelItem}>
                      <Text style={[s.wheelText, selH === h && s.wheelTextActive]}>{h}</Text>
                    </View>
                  ))}
                  <View style={{ height: ITEM_H }} />
                </ScrollView>
              </View>

              <Text style={s.colon}>:</Text>

              {/* Minute */}
              <View style={s.wheelWrap}>
                <View style={s.selectionBar} pointerEvents="none" />
                <ScrollView
                  ref={mRef}
                  style={s.wheel}
                  contentContainerStyle={s.wheelContent}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_H}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
                    setSelM(MINUTES[Math.min(idx, MINUTES.length - 1)]);
                  }}
                >
                  <View style={{ height: ITEM_H }} />
                  {MINUTES.map((m) => (
                    <View key={m} style={s.wheelItem}>
                      <Text style={[s.wheelText, selM === m && s.wheelTextActive]}>{m}</Text>
                    </View>
                  ))}
                  <View style={{ height: ITEM_H }} />
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View style={s.ampmWrap}>
                {(['AM', 'PM'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[s.ampmBtn, ampm === p && s.ampmBtnActive]}
                    onPress={() => setAmpm(p)}
                  >
                    <Text style={[s.ampmText, ampm === p && s.ampmTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

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
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerBtn: { paddingVertical: 4, paddingHorizontal: 4, minWidth: 60 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  cancelText: { fontSize: 15, color: colors.textMuted },
  doneText: { fontSize: 15, color: colors.accent, fontWeight: '700', textAlign: 'right' },

  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 4,
  },

  wheelWrap: {
    width: 72,
    height: ITEM_H * 3,
    overflow: 'hidden',
  },
  selectionBar: {
    position: 'absolute',
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentLight,
    borderRadius: 8,
    zIndex: 1,
  },
  wheel: { flex: 1 },
  wheelContent: {},
  wheelItem: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelText: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.textMuted,
  },
  wheelTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },

  colon: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: 4,
    marginBottom: 4,
  },

  ampmWrap: {
    marginLeft: 12,
    gap: 8,
  },
  ampmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  ampmBtnActive: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  ampmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  ampmTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
});
