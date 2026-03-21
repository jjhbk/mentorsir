import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { colors } from '../../theme/colors';
import { useConnectStore } from '../../store/useConnectStore';
import { useAuthStore } from '../../store/useAuthStore';
import DatePicker from '../../components/DatePicker';
import TimePicker from '../../components/TimePicker';
import {
  MAINS_TEST_SERIES_OPTIONS,
  PRELIMS_PYQ_OPTIONS,
  PRELIMS_TEST_SERIES_OPTIONS,
  RESOURCE_MAPPING_TEMPLATE,
} from '../../data/resourceMappingTemplate';
import { StudySession } from '../../types';

const PANELS = ['private', 'group', 'meetings', 'plan', 'mentor'] as const;
type Panel = (typeof PANELS)[number];
const VOICE_NOTES_STORAGE_KEY = 'mentorsir:voice-notes:v1';

type MeetingVoiceNote = {
  id: string;
  uri: string;
  createdAt: string;
  durationMs: number;
};

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
  const { profile, updateProfile, signOut } = useAuthStore();
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
  const [voiceNotes, setVoiceNotes] = useState<Record<string, MeetingVoiceNote[]>>({});
  const [recordingMeetingId, setRecordingMeetingId] = useState<string | null>(null);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(profile?.name ?? '');
  const [profileMobile, setProfileMobile] = useState(profile?.mobile ?? '');
  const [profileTelegram, setProfileTelegram] = useState(profile?.telegramId ?? '');

  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [meetingTime, setMeetingTime] = useState('10:00 AM');
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
  const [showMeetingDatePicker, setShowMeetingDatePicker] = useState(false);
  const [showMeetingTimePicker, setShowMeetingTimePicker] = useState(false);
  const [showScheduleDatePicker, setShowScheduleDatePicker] = useState(false);

  const [tgGroup, setTgGroup] = useState(profile?.telegramGroupLink ?? '');
  const [waGroup, setWaGroup] = useState(profile?.whatsappGroupLink ?? '');

  const [timerSubject, setTimerSubject] = useState<StudySession['subject']>('polity');
  const [timerNowMs, setTimerNowMs] = useState(Date.now());
  const [timerBusyAction, setTimerBusyAction] = useState<'start' | 'pause' | 'resume' | 'stop' | null>(null);
  const [timerFeedback, setTimerFeedback] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const hydrateVoiceNotes = async () => {
      try {
        const raw = await AsyncStorage.getItem(VOICE_NOTES_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Record<string, MeetingVoiceNote[]>;
        setVoiceNotes(parsed);
      } catch {
        setVoiceNotes({});
      }
    };
    hydrateVoiceNotes();
  }, []);

  useEffect(() => {
    setProfileName(profile?.name ?? '');
    setProfileMobile(profile?.mobile ?? '');
    setProfileTelegram(profile?.telegramId ?? '');
  }, [profile?.name, profile?.mobile, profile?.telegramId]);

  useEffect(
    () => () => {
      AudioRecorderPlayer.stopRecorder().catch(() => undefined);
      AudioRecorderPlayer.removeRecordBackListener();
      AudioRecorderPlayer.stopPlayer().catch(() => undefined);
      AudioRecorderPlayer.removePlayBackListener();
      AudioRecorderPlayer.removePlaybackEndListener();
    },
    []
  );

  useEffect(() => {
    setTgGroup(profile?.telegramGroupLink ?? '');
    setWaGroup(profile?.whatsappGroupLink ?? '');
  }, [profile?.telegramGroupLink, profile?.whatsappGroupLink]);

  useEffect(() => {
    if (peers.length > 0 && !selectedPeerId) {
      selectPeer(peers[0].id);
    }
  }, [peers, selectedPeerId, selectPeer]);

  useEffect(() => {
    if (!role) return;
    setMeetingNoteDraft((prev) => {
      const next = { ...prev };
      meetings.forEach((meeting) => {
        if (next[meeting.id] === undefined) {
          next[meeting.id] = role === 'mentor' ? meeting.mentorNotes : meeting.studentNotes;
        }
      });
      return next;
    });
  }, [meetings, role]);

  const activeSession = useMemo(
    () => studySessions.find((s) => s.status === 'active' || s.status === 'paused') ?? null,
    [studySessions]
  );

  const activeSessionElapsedSeconds = useMemo(() => {
    if (!activeSession) return 0;
    const runningDelta =
      activeSession.status === 'active' && activeSession.segmentStartedAt
        ? Math.max(0, Math.floor((timerNowMs - new Date(activeSession.segmentStartedAt).getTime()) / 1000))
        : 0;
    return activeSession.accumulatedSeconds + runningDelta;
  }, [activeSession, timerNowMs]);

  const studyHistoryByDay = useMemo(() => {
    const grouped: Record<string, { totalSeconds: number; sessionCount: number }> = {};
    studySessions.forEach((session) => {
      if (session.status !== 'completed') return;
      const day = session.startedAt.slice(0, 10);
      if (!grouped[day]) grouped[day] = { totalSeconds: 0, sessionCount: 0 };
      grouped[day].totalSeconds += session.accumulatedSeconds;
      grouped[day].sessionCount += 1;
    });

    return Object.entries(grouped)
      .map(([date, payload]) => ({ date, ...payload }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [studySessions]);

  const totalHistorySeconds = useMemo(
    () => studyHistoryByDay.reduce((sum, day) => sum + day.totalSeconds, 0),
    [studyHistoryByDay]
  );

  useEffect(() => {
    if (activeSession?.status !== 'active') return;
    const interval = setInterval(() => setTimerNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSession?.status]);

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
    const scheduledAt = mergeDateAndTimeToIso(meetingDate, meetingTime);
    if (!scheduledAt) {
      Alert.alert('Invalid date/time', 'Choose a valid meeting date and time.');
      return;
    }
    const result = await createMeeting({
      studentId: role === 'mentor' ? targetStudentId ?? undefined : undefined,
      scheduledAt,
      mode: meetingMode,
      meetingLink,
      agenda: meetingAgenda,
    });
    if (!result.ok) {
      Alert.alert('Unable to create meeting', result.error ?? 'Try again.');
      return;
    }
    setMeetingDate(new Date().toISOString().slice(0, 10));
    setMeetingTime('10:00 AM');
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

  const onTimerAction = async (
    action: 'start' | 'pause' | 'resume' | 'stop',
    payload?: { subject?: StudySession['subject']; sessionId?: string }
  ) => {
    setTimerBusyAction(action);
    const result = await studySessionAction(action, payload);
    setTimerBusyAction(null);

    if (!result.ok) {
      Alert.alert('Timer action failed', result.error ?? 'Try again.');
      return;
    }

    if (action === 'start') setTimerFeedback(`Started ${payload?.subject ?? timerSubject}.`);
    if (action === 'pause') setTimerFeedback('Session paused.');
    if (action === 'resume') setTimerFeedback('Session resumed.');
    if (action === 'stop') setTimerFeedback('Session stopped and study hours logged.');
  };

  const persistVoiceNotes = async (next: Record<string, MeetingVoiceNote[]>) => {
    setVoiceNotes(next);
    try {
      await AsyncStorage.setItem(VOICE_NOTES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      Alert.alert('Could not save voice note', 'Please try again.');
    }
  };

  const requestMicPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const onToggleRecordVoiceNote = async (meetingId: string) => {
    if (recordingMeetingId && recordingMeetingId !== meetingId) {
      Alert.alert('Recording in progress', 'Stop current recording before starting another one.');
      return;
    }

    if (!recordingMeetingId) {
      const granted = await requestMicPermission();
      if (!granted) {
        Alert.alert('Microphone permission required', 'Allow microphone access to record voice notes.');
        return;
      }
      try {
        setRecordingStartedAt(Date.now());
        await AudioRecorderPlayer.startRecorder();
        setRecordingMeetingId(meetingId);
      } catch {
        setRecordingStartedAt(null);
        setRecordingMeetingId(null);
        Alert.alert('Recording failed', 'Could not start recording.');
      }
      return;
    }

    try {
      const uri = await AudioRecorderPlayer.stopRecorder();
      AudioRecorderPlayer.removeRecordBackListener();
      const now = Date.now();
      const durationMs = recordingStartedAt ? Math.max(1, now - recordingStartedAt) : 1;
      const note: MeetingVoiceNote = {
        id: `${meetingId}:${now}`,
        uri,
        createdAt: new Date(now).toISOString(),
        durationMs,
      };
      const next = {
        ...voiceNotes,
        [meetingId]: [...(voiceNotes[meetingId] ?? []), note],
      };
      await persistVoiceNotes(next);
      Alert.alert('Voice note saved', 'Recording has been saved to this meeting.');
    } catch {
      Alert.alert('Recording failed', 'Could not save recording.');
    } finally {
      setRecordingMeetingId(null);
      setRecordingStartedAt(null);
    }
  };

  const onPlayVoiceNote = async (note: MeetingVoiceNote) => {
    try {
      if (playingVoiceNoteId === note.id) {
        await AudioRecorderPlayer.stopPlayer();
        AudioRecorderPlayer.removePlayBackListener();
        AudioRecorderPlayer.removePlaybackEndListener();
        setPlayingVoiceNoteId(null);
        return;
      }

      await AudioRecorderPlayer.stopPlayer().catch(() => undefined);
      AudioRecorderPlayer.removePlayBackListener();
      AudioRecorderPlayer.removePlaybackEndListener();

      await AudioRecorderPlayer.startPlayer(note.uri);
      setPlayingVoiceNoteId(note.id);

      AudioRecorderPlayer.addPlaybackEndListener(() => {
        setPlayingVoiceNoteId(null);
      });
    } catch {
      setPlayingVoiceNoteId(null);
      Alert.alert('Playback failed', 'Could not play this voice note.');
    }
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

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Text style={s.title}>Connect</Text>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.refreshBtn} onPress={refreshAll}>
              <Text style={s.refreshText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.profileIconBtn}
              onPress={() => setShowProfileModal(true)}
              accessibilityLabel="Open profile settings"
            >
              <Icon name="user" size={15} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

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
                style={s.input}
                placeholder="Name"
                placeholderTextColor={colors.textFaint}
                value={profileName}
                onChangeText={setProfileName}
              />
              <TextInput
                style={s.input}
                placeholder="Mobile number"
                placeholderTextColor={colors.textFaint}
                value={profileMobile}
                onChangeText={setProfileMobile}
                keyboardType="phone-pad"
              />
              <TextInput
                style={s.input}
                placeholder="Telegram ID"
                placeholderTextColor={colors.textFaint}
                value={profileTelegram}
                onChangeText={setProfileTelegram}
              />

              <TouchableOpacity style={s.primaryBtn} onPress={onSaveProfile}>
                <Text style={s.primaryBtnText}>Save Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.signOutBtn} onPress={onPressSignOut}>
                <Text style={s.signOutBtnText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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

            <Text style={s.pickerLabel}>Meeting date</Text>
            <TouchableOpacity style={s.input} onPress={() => setShowMeetingDatePicker(true)}>
              <Text style={s.inputText}>{meetingDate}</Text>
            </TouchableOpacity>

            <Text style={s.pickerLabel}>Meeting time</Text>
            <TouchableOpacity style={s.input} onPress={() => setShowMeetingTimePicker(true)}>
              <Text style={s.inputText}>{meetingTime}</Text>
            </TouchableOpacity>
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
                <TouchableOpacity
                  style={s.ghostBtn}
                  onPress={() => onToggleRecordVoiceNote(meeting.id)}
                >
                  <View style={s.inlineBtn}>
                    <Icon name="mic" size={14} color={colors.text} />
                    <Text style={s.ghostBtnText}>
                      {recordingMeetingId === meeting.id ? 'Stop & save recording' : 'Record voice note'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {(voiceNotes[meeting.id] ?? []).map((note) => (
                  <TouchableOpacity
                    key={note.id}
                    style={s.voiceRow}
                    onPress={() => onPlayVoiceNote(note)}
                  >
                    <View style={s.inlineBtn}>
                      <Icon name={playingVoiceNoteId === note.id ? 'square' : 'play'} size={14} color={colors.text} />
                      <Text style={s.voiceRowText}>
                        {new Date(note.createdAt).toLocaleString('en-IN')} • {Math.ceil(note.durationMs / 1000)}s
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

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
                <View style={s.timerCard}>
                  <View style={s.timerRowTop}>
                    <Text style={s.timerLabel}>Current session</Text>
                    <View
                      style={[
                        s.timerStatusPill,
                        activeSession?.status === 'active'
                          ? s.timerStatusActive
                          : activeSession?.status === 'paused'
                            ? s.timerStatusPaused
                            : s.timerStatusIdle,
                      ]}
                    >
                      <Text style={s.timerStatusText}>
                        {activeSession ? activeSession.status.toUpperCase() : 'IDLE'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.timerClock}>{formatDuration(activeSessionElapsedSeconds)}</Text>
                  <Text style={s.meetingMeta}>
                    {activeSession ? `Subject: ${activeSession.subject}` : `Ready: ${timerSubject}`}
                  </Text>
                  <Text style={s.meetingMeta}>Completed today: {(totalStudySeconds / 3600).toFixed(2)}h</Text>
                  <Text style={s.meetingMeta}>Total logged (14d): {(totalHistorySeconds / 3600).toFixed(2)}h</Text>
                  {timerFeedback ? <Text style={s.timerFeedbackText}>{timerFeedback}</Text> : null}
                </View>
                <View style={s.rowBtns}>
                  <TouchableOpacity
                    style={[
                      s.primaryBtnSmall,
                      (timerBusyAction !== null || Boolean(activeSession)) && s.timerBtnDisabled,
                    ]}
                    disabled={timerBusyAction !== null || Boolean(activeSession)}
                    onPress={() => onTimerAction('start', { subject: timerSubject })}
                  >
                    <Text style={s.primaryBtnText}>{timerBusyAction === 'start' ? 'Starting...' : 'Start'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.ghostBtnInline,
                      (timerBusyAction !== null || activeSession?.status !== 'active') && s.timerBtnDisabled,
                    ]}
                    disabled={timerBusyAction !== null || activeSession?.status !== 'active'}
                    onPress={() => activeSession && onTimerAction('pause', { sessionId: activeSession.id })}
                  >
                    <Text style={s.ghostBtnText}>{timerBusyAction === 'pause' ? 'Pausing...' : 'Pause'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.ghostBtnInline,
                      (timerBusyAction !== null || activeSession?.status !== 'paused') && s.timerBtnDisabled,
                    ]}
                    disabled={timerBusyAction !== null || activeSession?.status !== 'paused'}
                    onPress={() => activeSession && onTimerAction('resume', { sessionId: activeSession.id })}
                  >
                    <Text style={s.ghostBtnText}>{timerBusyAction === 'resume' ? 'Resuming...' : 'Resume'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.dangerBtnSmall,
                      (timerBusyAction !== null || !activeSession || activeSession.status === 'completed') && s.timerBtnDisabled,
                    ]}
                    disabled={timerBusyAction !== null || !activeSession || activeSession.status === 'completed'}
                    onPress={() => activeSession && onTimerAction('stop', { sessionId: activeSession.id })}
                  >
                    <Text style={s.primaryBtnText}>{timerBusyAction === 'stop' ? 'Stopping...' : 'Stop'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.timerHistoryCard}>
                  <Text style={s.timerHistoryTitle}>Study History by Day</Text>
                  {studyHistoryByDay.length === 0 ? (
                    <Text style={s.meetingMeta}>No completed sessions yet.</Text>
                  ) : (
                    studyHistoryByDay.map((day) => (
                      <View key={day.date} style={s.timerHistoryRow}>
                        <Text style={s.timerHistoryDate}>{new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN')}</Text>
                        <Text style={s.timerHistoryHours}>
                          {(day.totalSeconds / 3600).toFixed(2)}h • {day.sessionCount} session{day.sessionCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                    ))
                  )}
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
            <Text style={s.pickerLabel}>Schedule date</Text>
            <TouchableOpacity style={s.input} onPress={() => setShowScheduleDatePicker(true)}>
              <Text style={s.inputText}>{scheduleDate}</Text>
            </TouchableOpacity>
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

      <DatePicker
        visible={showMeetingDatePicker}
        value={meetingDate}
        label="Select meeting date"
        onCancel={() => setShowMeetingDatePicker(false)}
        onConfirm={(value) => {
          setMeetingDate(value);
          setShowMeetingDatePicker(false);
        }}
      />
      <TimePicker
        visible={showMeetingTimePicker}
        value={meetingTime}
        label="Select meeting time"
        onCancel={() => setShowMeetingTimePicker(false)}
        onConfirm={(value) => {
          setMeetingTime(value);
          setShowMeetingTimePicker(false);
        }}
      />
      <DatePicker
        visible={showScheduleDatePicker}
        value={scheduleDate}
        label="Select schedule date"
        onCancel={() => setShowScheduleDatePicker(false)}
        onConfirm={(value) => {
          setScheduleDate(value);
          setShowScheduleDatePicker(false);
        }}
      />
    </SafeAreaView>
  );
}

function mergeDateAndTimeToIso(dateIso: string, time12h: string): string | null {
  const dateMatch = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time12h.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const ampm = timeMatch[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  if (hours === 12) hours = 0;
  if (ampm === 'PM') hours += 12;

  const merged = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(merged.getTime())) return null;
  return merged.toISOString();
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  refreshText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  profileIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 18 },
  modalCard: { backgroundColor: colors.bg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 },
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
  signOutBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.dangerLight,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.dangerSubtle,
  },
  signOutBtnText: { color: colors.danger, fontWeight: '700', fontSize: 12 },

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
  inputText: {
    color: colors.text,
    fontSize: 14,
  },

  primaryBtn: { backgroundColor: colors.text, borderRadius: 10, alignItems: 'center', paddingVertical: 11 },
  primaryBtnSmall: { backgroundColor: colors.text, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  primaryBtnText: { color: colors.surface, fontSize: 12, fontWeight: '700' },

  ghostBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, alignItems: 'center', paddingVertical: 10, marginTop: 2 },
  ghostBtnInline: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  ghostBtnText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  inlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  voiceRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginTop: 8 },
  voiceRowText: { color: colors.text, fontSize: 12, fontWeight: '600' },

  dangerBtnSmall: { backgroundColor: colors.danger, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 },

  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 12 },
  rowBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  timerCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 8, marginBottom: 6 },
  timerRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timerLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  timerClock: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginBottom: 4 },
  timerStatusPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  timerStatusActive: { backgroundColor: colors.successLight },
  timerStatusPaused: { backgroundColor: colors.accentLight },
  timerStatusIdle: { backgroundColor: colors.surfaceAlt },
  timerStatusText: { color: colors.text, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  timerFeedbackText: { color: colors.success, fontSize: 12, fontWeight: '700', marginTop: 6 },
  timerBtnDisabled: { opacity: 0.55 },
  timerHistoryCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 10 },
  timerHistoryTitle: { color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  timerHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  timerHistoryDate: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  timerHistoryHours: { color: colors.text, fontSize: 12, fontWeight: '700' },

  meetingCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 10 },
  meetingTop: { color: colors.text, fontWeight: '800', fontSize: 12 },
  meetingMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  meetingBody: { color: colors.text, fontSize: 13, marginTop: 4 },

  planRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 10 },

  resourceCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 10 },
  resourceTitle: { color: colors.text, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  pickerLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4 },
});
