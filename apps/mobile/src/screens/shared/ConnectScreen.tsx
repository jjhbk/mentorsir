import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useConnectStore } from '../../store/useConnectStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  MAINS_TEST_SERIES_OPTIONS,
  PRELIMS_PYQ_OPTIONS,
  PRELIMS_TEST_SERIES_OPTIONS,
  RESOURCE_MAPPING_TEMPLATE,
} from '../../data/resourceMappingTemplate';
import { StudySession } from '../../types';

const PANELS = ['private', 'group', 'meetings', 'plan', 'mentor'] as const;
type Panel = (typeof PANELS)[number];

const STUDY_SUBJECTS: StudySession['subject'][] = [
  'polity',
  'geography',
  'economy',
  'csat',
  'prelims',
  'mains',
  'interview',
];

export default function ConnectScreen() {
  const { profile } = useAuthStore();
  const {
    loading,
    role,
    peers,
    selectedPeerId,
    messages,
    groupMessages,
    meetings,
    yearlyPlans,
    studySessions,
    totalStudySeconds,
    assignedStudents,
    targetStudentId,
    resourceMap,
    initialize,
    refreshAll,
    selectPeer,
    sendPrivateMessage,
    sendGroupMessage,
    createMeeting,
    reviewMeeting,
    saveMeetingNote,
    saveYearlyPlan,
    lockYearlyPlan,
    requestYearlyEdit,
    approveYearlyEdit,
    setTargetStudent,
    upsertResourceMapping,
    assignSchedule,
    studySessionAction,
    updateGroupLinks,
  } = useConnectStore();

  const [panel, setPanel] = useState<Panel>('private');
  const [privateDraft, setPrivateDraft] = useState('');
  const [groupDraft, setGroupDraft] = useState('');
  const [meetingNoteDraft, setMeetingNoteDraft] = useState<Record<string, string>>({});

  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [meetingMode, setMeetingMode] = useState('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');

  const [planMonth, setPlanMonth] = useState('');
  const [planSubject1, setPlanSubject1] = useState('');
  const [planSubject2, setPlanSubject2] = useState('');
  const [planSubject3, setPlanSubject3] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [planRequestNote, setPlanRequestNote] = useState('');

  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduleSubject, setScheduleSubject] = useState('');
  const [scheduleSyllabus, setScheduleSyllabus] = useState('');
  const [scheduleSource, setScheduleSource] = useState('');

  const [tgGroup, setTgGroup] = useState(profile?.telegramGroupLink ?? '');
  const [waGroup, setWaGroup] = useState(profile?.whatsappGroupLink ?? '');

  const [timerSubject, setTimerSubject] = useState<StudySession['subject']>('polity');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    setTgGroup(profile?.telegramGroupLink ?? '');
    setWaGroup(profile?.whatsappGroupLink ?? '');
  }, [profile?.telegramGroupLink, profile?.whatsappGroupLink]);

  useEffect(() => {
    if (peers.length > 0 && !selectedPeerId) {
      selectPeer(peers[0].id);
    }
  }, [peers, selectedPeerId, selectPeer]);

  const activeSession = useMemo(
    () => studySessions.find((s) => s.status === 'active' || s.status === 'paused') ?? null,
    [studySessions]
  );

  if (loading && role === null) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 120 }} />
      </SafeAreaView>
    );
  }

  const availablePanels = role === 'mentor' ? PANELS : PANELS.filter((p) => p !== 'mentor');

  const onPrivateSend = async () => {
    const result = await sendPrivateMessage(privateDraft);
    if (!result.ok) {
      Alert.alert('Message failed', result.error ?? 'Try again.');
      return;
    }
    setPrivateDraft('');
  };

  const onGroupSend = async () => {
    const result = await sendGroupMessage(groupDraft);
    if (!result.ok) {
      Alert.alert('Message failed', result.error ?? 'Try again.');
      return;
    }
    setGroupDraft('');
  };

  const onCreateMeeting = async () => {
    const result = await createMeeting({
      studentId: role === 'mentor' ? targetStudentId ?? undefined : undefined,
      scheduledAt: meetingDateTime,
      mode: meetingMode,
      meetingLink,
      agenda: meetingAgenda,
    });
    if (!result.ok) {
      Alert.alert('Unable to create meeting', result.error ?? 'Try again.');
      return;
    }
    setMeetingDateTime('');
    setMeetingMode('online');
    setMeetingLink('');
    setMeetingAgenda('');
  };

  const onSavePlan = async () => {
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
  };

  const onSaveLinks = async () => {
    const result = await updateGroupLinks(tgGroup, waGroup);
    if (!result.ok) {
      Alert.alert('Unable to save links', result.error ?? 'Try again.');
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Text style={s.title}>Connect</Text>
          <TouchableOpacity style={s.refreshBtn} onPress={refreshAll}>
            <Text style={s.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={s.panelTabs}>
          {availablePanels.map((name) => (
            <TouchableOpacity
              key={name}
              style={[s.panelTab, panel === name && s.panelTabActive]}
              onPress={() => setPanel(name)}
            >
              <Text style={[s.panelTabText, panel === name && s.panelTabTextActive]}>{labelForPanel(name)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {panel === 'private' ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Private Chat</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.peerRow}>
              {peers.map((peer) => (
                <TouchableOpacity
                  key={peer.id}
                  onPress={() => selectPeer(peer.id)}
                  style={[s.peerChip, selectedPeerId === peer.id && s.peerChipActive]}
                >
                  <Text style={[s.peerChipText, selectedPeerId === peer.id && s.peerChipTextActive]}>
                    {peer.name ?? 'Unknown'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.messagesWrap}>
              {messages.length === 0 ? (
                <Text style={s.emptyText}>No messages yet.</Text>
              ) : (
                messages.map((msg) => (
                  <View key={msg.id} style={s.messageRow}>
                    <Text style={s.messageMeta}>{new Date(msg.createdAt).toLocaleString('en-IN')}</Text>
                    <Text style={s.messageBody}>{msg.message}</Text>
                  </View>
                ))
              )}
            </View>

            <TextInput
              style={s.input}
              placeholder="Type a message"
              placeholderTextColor={colors.textFaint}
              value={privateDraft}
              onChangeText={setPrivateDraft}
            />
            <TouchableOpacity style={s.primaryBtn} onPress={onPrivateSend}>
              <Text style={s.primaryBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {panel === 'group' ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Group Chat</Text>
            <View style={s.messagesWrap}>
              {groupMessages.length === 0 ? (
                <Text style={s.emptyText}>No group messages yet.</Text>
              ) : (
                groupMessages.map((msg) => (
                  <View key={msg.id} style={s.messageRow}>
                    <Text style={s.messageMeta}>
                      {(msg.senderName ?? 'Unknown') + ' • ' + new Date(msg.createdAt).toLocaleString('en-IN')}
                    </Text>
                    <Text style={s.messageBody}>{msg.message}</Text>
                  </View>
                ))
              )}
            </View>
            <TextInput
              style={s.input}
              placeholder="Message everyone"
              placeholderTextColor={colors.textFaint}
              value={groupDraft}
              onChangeText={setGroupDraft}
            />
            <TouchableOpacity style={s.primaryBtn} onPress={onGroupSend}>
              <Text style={s.primaryBtnText}>Send to Group</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {panel === 'meetings' ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Meetings</Text>

            <TextInput
              style={s.input}
              placeholder="Scheduled at (ISO), e.g. 2026-04-01T14:00:00+05:30"
              placeholderTextColor={colors.textFaint}
              value={meetingDateTime}
              onChangeText={setMeetingDateTime}
            />
            <TextInput
              style={s.input}
              placeholder="Mode (online/call/in-person)"
              placeholderTextColor={colors.textFaint}
              value={meetingMode}
              onChangeText={setMeetingMode}
            />
            <TextInput
              style={s.input}
              placeholder="Meeting link (optional)"
              placeholderTextColor={colors.textFaint}
              value={meetingLink}
              onChangeText={setMeetingLink}
            />
            <TextInput
              style={s.input}
              placeholder="Agenda"
              placeholderTextColor={colors.textFaint}
              value={meetingAgenda}
              onChangeText={setMeetingAgenda}
            />
            <TouchableOpacity style={s.primaryBtn} onPress={onCreateMeeting}>
              <Text style={s.primaryBtnText}>{role === 'mentor' ? 'Create Approved Meeting' : 'Request Meeting'}</Text>
            </TouchableOpacity>

            <View style={s.divider} />

            {meetings.map((meeting) => (
              <View key={meeting.id} style={s.meetingCard}>
                <Text style={s.meetingTop}>
                  {new Date(meeting.scheduledAt).toLocaleString('en-IN')} • {meeting.status.toUpperCase()}
                </Text>
                <Text style={s.meetingMeta}>{meeting.studentName ?? meeting.mentorName ?? 'Meeting'}</Text>
                {meeting.agenda ? <Text style={s.meetingBody}>Agenda: {meeting.agenda}</Text> : null}
                {meeting.meetingLink ? <Text style={s.meetingBody}>Link: {meeting.meetingLink}</Text> : null}

                <TextInput
                  style={s.input}
                  placeholder={role === 'mentor' ? 'Mentor notes' : 'Student notes'}
                  placeholderTextColor={colors.textFaint}
                  value={meetingNoteDraft[meeting.id] ?? ''}
                  onChangeText={(v) => setMeetingNoteDraft((prev) => ({ ...prev, [meeting.id]: v }))}
                />
                <TouchableOpacity
                  style={s.ghostBtn}
                  onPress={async () => {
                    const result = await saveMeetingNote(meeting.id, meetingNoteDraft[meeting.id] ?? '');
                    if (!result.ok) Alert.alert('Could not save note', result.error ?? 'Try again.');
                  }}
                >
                  <Text style={s.ghostBtnText}>Save note</Text>
                </TouchableOpacity>

                {role === 'mentor' && meeting.status === 'pending' ? (
                  <View style={s.rowBtns}>
                    <TouchableOpacity
                      style={s.primaryBtnSmall}
                      onPress={async () => {
                        const result = await reviewMeeting(meeting.id, 'approved', {
                          scheduledAt: meeting.scheduledAt,
                          mode: meeting.mode,
                          meetingLink: meeting.meetingLink,
                          agenda: meeting.agenda,
                        });
                        if (!result.ok) Alert.alert('Approval failed', result.error ?? 'Try again.');
                      }}
                    >
                      <Text style={s.primaryBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.dangerBtnSmall}
                      onPress={async () => {
                        const result = await reviewMeeting(meeting.id, 'rejected', {
                          rejectionReason: 'Rejected by mentor',
                        });
                        if (!result.ok) Alert.alert('Rejection failed', result.error ?? 'Try again.');
                      }}
                    >
                      <Text style={s.primaryBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {panel === 'plan' ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Yearly Plan</Text>

            <TextInput style={s.input} placeholder="Month (JAN/FEB/MAR)" placeholderTextColor={colors.textFaint} value={planMonth} onChangeText={setPlanMonth} />
            <TextInput style={s.input} placeholder="Subject 1" placeholderTextColor={colors.textFaint} value={planSubject1} onChangeText={setPlanSubject1} />
            <TextInput style={s.input} placeholder="Subject 2" placeholderTextColor={colors.textFaint} value={planSubject2} onChangeText={setPlanSubject2} />
            <TextInput style={s.input} placeholder="Subject 3" placeholderTextColor={colors.textFaint} value={planSubject3} onChangeText={setPlanSubject3} />
            <TextInput style={s.input} placeholder="Notes" placeholderTextColor={colors.textFaint} value={planNotes} onChangeText={setPlanNotes} />
            <TouchableOpacity style={s.primaryBtn} onPress={onSavePlan}>
              <Text style={s.primaryBtnText}>Save Plan</Text>
            </TouchableOpacity>

            {yearlyPlans.map((plan) => (
              <View key={plan.id} style={s.planRow}>
                <Text style={s.meetingTop}>{plan.month}</Text>
                <Text style={s.meetingMeta}>{[plan.subject1, plan.subject2, plan.subject3].filter(Boolean).join(' · ') || 'No subjects yet'}</Text>
                {plan.notes ? <Text style={s.meetingBody}>{plan.notes}</Text> : null}
                <View style={s.rowBtns}>
                  <TouchableOpacity
                    style={s.ghostBtnInline}
                    onPress={async () => {
                      const result = await lockYearlyPlan(plan.month);
                      if (!result.ok) Alert.alert('Unable to lock', result.error ?? 'Try again.');
                    }}
                  >
                    <Text style={s.ghostBtnText}>Lock</Text>
                  </TouchableOpacity>

                  {role === 'student' ? (
                    <TouchableOpacity
                      style={s.ghostBtnInline}
                      onPress={async () => {
                        const result = await requestYearlyEdit(plan.month, planRequestNote);
                        if (!result.ok) Alert.alert('Unable to request edit', result.error ?? 'Try again.');
                      }}
                    >
                      <Text style={s.ghostBtnText}>Request Edit</Text>
                    </TouchableOpacity>
                  ) : plan.studentEditRequestPending && targetStudentId ? (
                    <TouchableOpacity
                      style={s.ghostBtnInline}
                      onPress={async () => {
                        const result = await approveYearlyEdit(plan.month, targetStudentId);
                        if (!result.ok) Alert.alert('Unable to approve edit', result.error ?? 'Try again.');
                      }}
                    >
                      <Text style={s.ghostBtnText}>Approve Edit</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))}

            {role === 'student' ? (
              <>
                <TextInput
                  style={s.input}
                  placeholder="Edit request note"
                  placeholderTextColor={colors.textFaint}
                  value={planRequestNote}
                  onChangeText={setPlanRequestNote}
                />

                <View style={s.divider} />
                <Text style={s.cardTitle}>Study Timer</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.peerRow}>
                  {STUDY_SUBJECTS.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={[s.peerChip, timerSubject === subject && s.peerChipActive]}
                      onPress={() => setTimerSubject(subject)}
                    >
                      <Text style={[s.peerChipText, timerSubject === subject && s.peerChipTextActive]}>{subject}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={s.meetingMeta}>Completed today: {(totalStudySeconds / 3600).toFixed(2)}h</Text>
                {activeSession ? (
                  <Text style={s.meetingMeta}>Active: {activeSession.subject} ({activeSession.status})</Text>
                ) : (
                  <Text style={s.meetingMeta}>No active session</Text>
                )}
                <View style={s.rowBtns}>
                  <TouchableOpacity
                    style={s.primaryBtnSmall}
                    onPress={() => studySessionAction('start', { subject: timerSubject })}
                  >
                    <Text style={s.primaryBtnText}>Start</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.ghostBtnInline}
                    onPress={() => activeSession && studySessionAction('pause', { sessionId: activeSession.id })}
                  >
                    <Text style={s.ghostBtnText}>Pause</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.ghostBtnInline}
                    onPress={() => activeSession && studySessionAction('resume', { sessionId: activeSession.id })}
                  >
                    <Text style={s.ghostBtnText}>Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.dangerBtnSmall}
                    onPress={() => activeSession && studySessionAction('stop', { sessionId: activeSession.id })}
                  >
                    <Text style={s.primaryBtnText}>Stop</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {panel === 'mentor' && role === 'mentor' ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Mentor Tools</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.peerRow}>
              {assignedStudents.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={[s.peerChip, targetStudentId === st.id && s.peerChipActive]}
                  onPress={() => setTargetStudent(st.id)}
                >
                  <Text style={[s.peerChipText, targetStudentId === st.id && s.peerChipTextActive]}>{st.name ?? 'Student'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.sectionTitle}>Assign Schedule</Text>
            <TextInput style={s.input} placeholder="Date (YYYY-MM-DD)" placeholderTextColor={colors.textFaint} value={scheduleDate} onChangeText={setScheduleDate} />
            <TextInput style={s.input} placeholder="Subject" placeholderTextColor={colors.textFaint} value={scheduleSubject} onChangeText={setScheduleSubject} />
            <TextInput style={s.input} placeholder="Syllabus" placeholderTextColor={colors.textFaint} value={scheduleSyllabus} onChangeText={setScheduleSyllabus} />
            <TextInput style={s.input} placeholder="Primary source" placeholderTextColor={colors.textFaint} value={scheduleSource} onChangeText={setScheduleSource} />
            <TouchableOpacity
              style={s.primaryBtn}
              onPress={async () => {
                if (!targetStudentId) {
                  Alert.alert('Choose student', 'Select a student before assigning schedule.');
                  return;
                }
                const result = await assignSchedule({
                  studentId: targetStudentId,
                  date: scheduleDate,
                  subject: scheduleSubject,
                  syllabus: scheduleSyllabus,
                  primarySource: scheduleSource,
                  entryType: 'study',
                });
                if (!result.ok) Alert.alert('Assignment failed', result.error ?? 'Try again.');
              }}
            >
              <Text style={s.primaryBtnText}>Assign</Text>
            </TouchableOpacity>

            <View style={s.divider} />
            <Text style={s.sectionTitle}>Group Links</Text>
            <TextInput style={s.input} placeholder="Telegram group link" placeholderTextColor={colors.textFaint} value={tgGroup} onChangeText={setTgGroup} />
            <TextInput style={s.input} placeholder="WhatsApp group link" placeholderTextColor={colors.textFaint} value={waGroup} onChangeText={setWaGroup} />
            <TouchableOpacity style={s.ghostBtn} onPress={onSaveLinks}>
              <Text style={s.ghostBtnText}>Save Group Links</Text>
            </TouchableOpacity>

            <View style={s.divider} />
            <Text style={s.sectionTitle}>Resource Mapping</Text>
            {RESOURCE_MAPPING_TEMPLATE.map((row) => {
              const mapped = resourceMap[row.rowKey];
              return (
                <View key={row.rowKey} style={s.resourceCard}>
                  <Text style={s.resourceTitle}>{row.paper} • {row.subject} • {row.part}</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Resource"
                    placeholderTextColor={colors.textFaint}
                    defaultValue={mapped?.resource ?? ''}
                    onChangeText={(text) => {
                      const current = resourceMap[row.rowKey] ?? {
                        id: '',
                        rowKey: row.rowKey,
                        resource: '',
                        prelimsPyqPractice: '',
                        prelimsTestSeries: '',
                        mainsPyq: '',
                      };
                      useConnectStore.setState({
                        resourceMap: {
                          ...useConnectStore.getState().resourceMap,
                          [row.rowKey]: { ...current, resource: text },
                        },
                      });
                    }}
                  />
                  <PickerRow
                    label="Prelims PYQ"
                    options={PRELIMS_PYQ_OPTIONS as unknown as string[]}
                    value={mapped?.prelimsPyqPractice ?? ''}
                    onPick={(value) =>
                      useConnectStore.setState({
                        resourceMap: {
                          ...useConnectStore.getState().resourceMap,
                          [row.rowKey]: {
                            ...(useConnectStore.getState().resourceMap[row.rowKey] ?? {
                              id: '',
                              rowKey: row.rowKey,
                              resource: '',
                              prelimsPyqPractice: '',
                              prelimsTestSeries: '',
                              mainsPyq: '',
                            }),
                            prelimsPyqPractice: value,
                          },
                        },
                      })
                    }
                  />
                  <PickerRow
                    label="Prelims Test"
                    options={PRELIMS_TEST_SERIES_OPTIONS as unknown as string[]}
                    value={mapped?.prelimsTestSeries ?? ''}
                    onPick={(value) =>
                      useConnectStore.setState({
                        resourceMap: {
                          ...useConnectStore.getState().resourceMap,
                          [row.rowKey]: {
                            ...(useConnectStore.getState().resourceMap[row.rowKey] ?? {
                              id: '',
                              rowKey: row.rowKey,
                              resource: '',
                              prelimsPyqPractice: '',
                              prelimsTestSeries: '',
                              mainsPyq: '',
                            }),
                            prelimsTestSeries: value,
                          },
                        },
                      })
                    }
                  />
                  <PickerRow
                    label="Mains PYQ"
                    options={MAINS_TEST_SERIES_OPTIONS as unknown as string[]}
                    value={mapped?.mainsPyq ?? ''}
                    onPick={(value) =>
                      useConnectStore.setState({
                        resourceMap: {
                          ...useConnectStore.getState().resourceMap,
                          [row.rowKey]: {
                            ...(useConnectStore.getState().resourceMap[row.rowKey] ?? {
                              id: '',
                              rowKey: row.rowKey,
                              resource: '',
                              prelimsPyqPractice: '',
                              prelimsTestSeries: '',
                              mainsPyq: '',
                            }),
                            mainsPyq: value,
                          },
                        },
                      })
                    }
                  />
                  <TouchableOpacity
                    style={s.ghostBtn}
                    onPress={async () => {
                      const val = useConnectStore.getState().resourceMap[row.rowKey];
                      const result = await upsertResourceMapping(row.rowKey, {
                        resource: val?.resource,
                        prelimsPyqPractice: val?.prelimsPyqPractice,
                        prelimsTestSeries: val?.prelimsTestSeries,
                        mainsPyq: val?.mainsPyq,
                      });
                      if (!result.ok) Alert.alert('Resource save failed', result.error ?? 'Try again.');
                    }}
                  >
                    <Text style={s.ghostBtnText}>Save row</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function PickerRow({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: string[];
  value: string;
  onPick: (value: string) => void;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.pickerLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.peerRow}>
        {options.map((opt) => (
          <TouchableOpacity key={opt} style={[s.peerChip, value === opt && s.peerChipActive]} onPress={() => onPick(opt)}>
            <Text style={[s.peerChipText, value === opt && s.peerChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function labelForPanel(panel: Panel): string {
  if (panel === 'private') return 'Private';
  if (panel === 'group') return 'Group';
  if (panel === 'meetings') return 'Meetings';
  if (panel === 'plan') return 'Plan';
  return 'Mentor';
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 56, gap: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  refreshText: { color: colors.text, fontWeight: '700', fontSize: 12 },

  panelTabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  panelTab: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 999 },
  panelTabActive: { backgroundColor: colors.text, borderColor: colors.text },
  panelTabText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  panelTabTextActive: { color: colors.surface },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },

  peerRow: { gap: 8, paddingBottom: 8 },
  peerChip: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 999 },
  peerChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  peerChipText: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  peerChipTextActive: { color: colors.surface },

  messagesWrap: { maxHeight: 280, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginBottom: 8 },
  messageRow: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  messageMeta: { fontSize: 11, color: colors.textMuted, marginBottom: 3 },
  messageBody: { fontSize: 13, color: colors.text },
  emptyText: { color: colors.textMuted, fontSize: 13 },

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

  primaryBtn: { backgroundColor: colors.text, borderRadius: 10, alignItems: 'center', paddingVertical: 11 },
  primaryBtnSmall: { backgroundColor: colors.text, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  primaryBtnText: { color: colors.surface, fontSize: 12, fontWeight: '700' },

  ghostBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, alignItems: 'center', paddingVertical: 10, marginTop: 2 },
  ghostBtnInline: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  ghostBtnText: { color: colors.text, fontWeight: '700', fontSize: 12 },

  dangerBtnSmall: { backgroundColor: colors.danger, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 },

  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 12 },
  rowBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },

  meetingCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 10 },
  meetingTop: { color: colors.text, fontWeight: '800', fontSize: 12 },
  meetingMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  meetingBody: { color: colors.text, fontSize: 13, marginTop: 4 },

  planRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 10 },

  resourceCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 10 },
  resourceTitle: { color: colors.text, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  pickerLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4 },
});
