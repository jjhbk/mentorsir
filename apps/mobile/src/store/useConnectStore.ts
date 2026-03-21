import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  ChatMessage,
  ChatPeer,
  GroupMessage,
  MeetingEntry,
  ResourceMappingValue,
  StudySession,
  YearlyPlanEntry,
} from '../types';

interface MeetingCreateInput {
  studentId?: string;
  scheduledAt: string;
  mode?: string;
  meetingLink?: string;
  agenda?: string;
}

interface AssignScheduleInput {
  studentId: string;
  date: string;
  subject?: string;
  syllabus?: string;
  primarySource?: string;
  entryType?: 'study' | 'ca-test' | 'sectional-test' | 'mentor-connect';
}

interface ConnectState {
  loading: boolean;
  role: 'student' | 'mentor' | null;
  currentUserId: string | null;
  mentorId: string | null;
  mentorTelegramId: string | null;
  mentorWhatsappNumber: string | null;
  telegramGroupLink: string | null;
  whatsappGroupLink: string | null;
  peers: ChatPeer[];
  selectedPeerId: string | null;
  messages: ChatMessage[];
  groupMessages: GroupMessage[];
  meetings: MeetingEntry[];
  yearlyPlans: YearlyPlanEntry[];
  studySessions: StudySession[];
  totalStudySeconds: number;
  assignedStudents: { id: string; name: string | null }[];
  targetStudentId: string | null;
  resourceMap: Record<string, ResourceMappingValue>;

  initialize: () => Promise<void>;
  refreshAll: () => Promise<void>;
  selectPeer: (peerId: string) => Promise<void>;
  sendPrivateMessage: (message: string) => Promise<{ ok: boolean; error?: string }>;
  sendGroupMessage: (message: string) => Promise<{ ok: boolean; error?: string }>;
  createMeeting: (input: MeetingCreateInput) => Promise<{ ok: boolean; error?: string }>;
  reviewMeeting: (
    meetingId: string,
    status: 'approved' | 'rejected',
    input?: Partial<MeetingCreateInput> & { rejectionReason?: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  saveMeetingNote: (meetingId: string, note: string) => Promise<{ ok: boolean; error?: string }>;
  saveYearlyPlan: (
    month: string,
    subject1: string,
    subject2: string,
    subject3: string,
    notes: string,
    targetStudentId?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  lockYearlyPlan: (month: string, targetStudentId?: string) => Promise<{ ok: boolean; error?: string }>;
  requestYearlyEdit: (month: string, requestNote: string) => Promise<{ ok: boolean; error?: string }>;
  approveYearlyEdit: (month: string, targetStudentId: string) => Promise<{ ok: boolean; error?: string }>;
  setTargetStudent: (studentId: string) => Promise<void>;
  upsertResourceMapping: (
    rowKey: string,
    values: { resource?: string; prelimsPyqPractice?: string; prelimsTestSeries?: string; mainsPyq?: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  assignSchedule: (input: AssignScheduleInput) => Promise<{ ok: boolean; error?: string }>;
  studySessionAction: (
    action: 'start' | 'pause' | 'resume' | 'stop',
    payload?: { subject?: StudySession['subject']; sessionId?: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  updateGroupLinks: (telegramGroupLink: string, whatsappGroupLink: string) => Promise<{ ok: boolean; error?: string }>;
}

function norm(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function mapMeeting(row: Record<string, unknown>): MeetingEntry {
  return {
    id: norm(row.id),
    mentorId: norm(row.mentor_id),
    studentId: norm(row.student_id),
    scheduledAt: norm(row.scheduled_at),
    status: (row.status as MeetingEntry['status']) ?? 'pending',
    mode: norm(row.mode),
    meetingLink: norm(row.meeting_link),
    agenda: norm(row.agenda),
    studentNotes: norm(row.student_notes),
    mentorNotes: norm(row.mentor_notes),
    rejectionReason: norm(row.rejection_reason),
    studentName: null,
    mentorName: null,
  };
}

async function hydrateNames(meetings: MeetingEntry[]): Promise<MeetingEntry[]> {
  const ids = new Set<string>();
  meetings.forEach((m) => {
    ids.add(m.studentId);
    ids.add(m.mentorId);
  });
  if (ids.size === 0) return meetings;

  const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', Array.from(ids));

  const nameMap = new Map<string, string | null>();
  (profiles ?? []).forEach((p) => nameMap.set(p.id, p.name));

  return meetings.map((m) => ({
    ...m,
    studentName: nameMap.get(m.studentId) ?? null,
    mentorName: nameMap.get(m.mentorId) ?? null,
  }));
}

async function fetchSessions(userId: string): Promise<{ sessions: StudySession[]; totalStudySeconds: number }> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 13);
  const fromIso = windowStart.toISOString().slice(0, 10);
  const { data } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', fromIso + 'T00:00:00.000Z')
    .lt('started_at', today + 'T23:59:59.999Z')
    .order('started_at', { ascending: false })
    .limit(500);

  const sessions = (data ?? []).map((row) => ({
    id: row.id,
    subject: row.subject,
    status: row.status,
    startedAt: row.started_at,
    segmentStartedAt: row.segment_started_at,
    accumulatedSeconds: Number(row.accumulated_seconds ?? 0),
    endedAt: row.ended_at,
  })) as StudySession[];

  const totalStudySeconds = sessions
    .filter((s) => s.status === 'completed' && s.startedAt.slice(0, 10) === today)
    .reduce((sum, s) => sum + s.accumulatedSeconds, 0);

  return { sessions, totalStudySeconds };
}

async function appendStudyHoursToDailyLog(userId: string, additionalSeconds: number): Promise<void> {
  if (additionalSeconds <= 0) return;

  const date = new Date().toISOString().slice(0, 10);
  const additionalHours = Number((additionalSeconds / 3600).toFixed(1));
  if (additionalHours <= 0) return;

  const { data: existingRow } = await supabase
    .from('daily_logs')
    .select('study_hours')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  const currentStudyHours = Number(existingRow?.study_hours ?? 0);
  const nextStudyHours = Number((currentStudyHours + additionalHours).toFixed(1));

  await supabase.from('daily_logs').upsert(
    {
      user_id: userId,
      date,
      study_hours: nextStudyHours,
    },
    { onConflict: 'user_id,date' }
  );
}

export const useConnectStore = create<ConnectState>((set, get) => ({
  loading: false,
  role: null,
  currentUserId: null,
  mentorId: null,
  mentorTelegramId: null,
  mentorWhatsappNumber: null,
  telegramGroupLink: null,
  whatsappGroupLink: null,
  peers: [],
  selectedPeerId: null,
  messages: [],
  groupMessages: [],
  meetings: [],
  yearlyPlans: [],
  studySessions: [],
  totalStudySeconds: 0,
  assignedStudents: [],
  targetStudentId: null,
  resourceMap: {},

  initialize: async () => {
    await get().refreshAll();
  },

  refreshAll: async () => {
    set({ loading: true });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false });
      return;
    }

    const { data: me } = await supabase
      .from('profiles')
      .select('id, role, mentor_id')
      .eq('id', user.id)
      .single();

    if (!me || (me.role !== 'student' && me.role !== 'mentor')) {
      set({ loading: false, role: null });
      return;
    }

    let peers: ChatPeer[] = [];
    let assignedStudents: { id: string; name: string | null }[] = [];
    const mentorId: string | null = me.role === 'mentor' ? user.id : me.mentor_id;
    let mentorTelegramId: string | null = null;
    let mentorWhatsappNumber: string | null = null;
    let telegramGroupLink: string | null = null;
    let whatsappGroupLink: string | null = null;

    if (me.role === 'student' && me.mentor_id) {
      const { data: mentor } = await supabase
        .from('profiles')
        .select('id, name, mobile, telegram_id, telegram_group_link, whatsapp_group_link')
        .eq('id', me.mentor_id)
        .single();
      if (mentor) {
        mentorTelegramId = mentor.telegram_id;
        mentorWhatsappNumber = mentor.mobile;
        telegramGroupLink = mentor.telegram_group_link;
        whatsappGroupLink = mentor.whatsapp_group_link;
        peers = [
          {
            id: mentor.id,
            name: mentor.name,
            mobile: mentor.mobile,
            telegramId: mentor.telegram_id,
            kind: 'mentor',
          },
        ];
      }
    }

    if (me.role === 'mentor') {
      const { data: meWithLinks } = await supabase
        .from('profiles')
        .select('telegram_id, mobile, telegram_group_link, whatsapp_group_link')
        .eq('id', user.id)
        .single();
      mentorTelegramId = meWithLinks?.telegram_id ?? null;
      mentorWhatsappNumber = meWithLinks?.mobile ?? null;
      telegramGroupLink = meWithLinks?.telegram_group_link ?? null;
      whatsappGroupLink = meWithLinks?.whatsapp_group_link ?? null;

      const { data: students } = await supabase
        .from('profiles')
        .select('id, name, mobile, telegram_id')
        .eq('role', 'student')
        .eq('mentor_id', user.id)
        .order('name', { ascending: true });

      peers = (students ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        mobile: s.mobile,
        telegramId: s.telegram_id,
        kind: 'student' as const,
      }));

      assignedStudents = (students ?? []).map((s) => ({ id: s.id, name: s.name }));
    }

    const targetStudentId = get().targetStudentId ?? assignedStudents[0]?.id ?? null;

    const [messages, groupMessages, meetings, yearlyPlans, resourceMap, sessionsPayload] = await Promise.all([
      (async () => {
        const selectedPeerId = get().selectedPeerId ?? peers[0]?.id ?? null;
        if (!selectedPeerId) return [] as ChatMessage[];

        const match =
          me.role === 'mentor'
            ? { mentor_id: user.id, student_id: selectedPeerId }
            : { mentor_id: selectedPeerId, student_id: user.id };

        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .match(match)
          .order('created_at', { ascending: true })
          .limit(500);

        await supabase
          .from('chat_messages')
          .update({ read_at: new Date().toISOString() })
          .match(match)
          .neq('sender_id', user.id)
          .is('read_at', null);

        return (data ?? []).map((row) => ({
          id: row.id,
          mentorId: row.mentor_id,
          studentId: row.student_id,
          senderId: row.sender_id,
          message: row.message,
          createdAt: row.created_at,
        }));
      })(),
      (async () => {
        if (!mentorId) return [] as GroupMessage[];
        const { data } = await supabase
          .from('mentor_group_messages')
          .select('*')
          .eq('mentor_id', mentorId)
          .order('created_at', { ascending: true })
          .limit(500);

        const senderIds = Array.from(new Set((data ?? []).map((m) => m.sender_id)));
        const { data: senderProfiles } = senderIds.length
          ? await supabase.from('profiles').select('id, name').in('id', senderIds)
          : { data: [] as Array<{ id: string; name: string | null }> };

        const senderMap = new Map((senderProfiles ?? []).map((s) => [s.id, s.name]));

        return (data ?? []).map((row) => ({
          id: row.id,
          mentorId: row.mentor_id,
          senderId: row.sender_id,
          senderName: senderMap.get(row.sender_id) ?? null,
          message: row.message,
          createdAt: row.created_at,
        }));
      })(),
      (async () => {
        const { data } = await supabase
          .from('mentor_meetings')
          .select('*')
          .eq(me.role === 'mentor' ? 'mentor_id' : 'student_id', user.id)
          .order('scheduled_at', { ascending: false })
          .limit(200);

        return hydrateNames((data ?? []).map(mapMeeting));
      })(),
      (async () => {
        const planOwnerId = me.role === 'mentor' ? targetStudentId ?? user.id : user.id;
        const { data } = await supabase
          .from('yearly_plan_entries')
          .select('*')
          .eq('user_id', planOwnerId)
          .order('month', { ascending: true });

        return (data ?? []).map((row) => ({
          id: row.id,
          month: row.month,
          subject1: norm(row.subject_1),
          subject2: norm(row.subject_2),
          subject3: norm(row.subject_3),
          notes: norm(row.notes),
          isLocked: Boolean(row.is_locked),
          studentEditRequestPending: Boolean(row.student_edit_request_pending),
          studentEditRequestNote: norm(row.student_edit_request_note),
        }));
      })(),
      (async () => {
        const ownerId = me.role === 'mentor' ? targetStudentId : user.id;
        if (!ownerId) return {};
        const { data } = await supabase
          .from('resource_mapping_values')
          .select('*')
          .eq('owner_id', ownerId);

        return (data ?? []).reduce<Record<string, ResourceMappingValue>>((acc, row) => {
          acc[row.row_key] = {
            id: row.id,
            rowKey: row.row_key,
            resource: norm(row.resource),
            prelimsPyqPractice: norm(row.prelims_pyq_practice),
            prelimsTestSeries: norm(row.prelims_test_series),
            mainsPyq: norm(row.mains_pyq),
          };
          return acc;
        }, {});
      })(),
      me.role === 'student' ? fetchSessions(user.id) : Promise.resolve({ sessions: [], totalStudySeconds: 0 }),
    ]);

    set({
      loading: false,
      role: me.role,
      currentUserId: user.id,
      mentorId,
      mentorTelegramId,
      mentorWhatsappNumber,
      telegramGroupLink,
      whatsappGroupLink,
      peers,
      assignedStudents,
      targetStudentId,
      selectedPeerId: get().selectedPeerId ?? peers[0]?.id ?? null,
      messages,
      groupMessages,
      meetings,
      yearlyPlans,
      resourceMap,
      studySessions: sessionsPayload.sessions,
      totalStudySeconds: sessionsPayload.totalStudySeconds,
    });
  },

  selectPeer: async (peerId) => {
    set({ selectedPeerId: peerId });
    await get().refreshAll();
  },

  sendPrivateMessage: async (message) => {
    const text = message.trim();
    if (!text) return { ok: false, error: 'Message cannot be empty' };

    const { role, currentUserId, selectedPeerId } = get();
    if (!role || !currentUserId || !selectedPeerId) {
      return { ok: false, error: 'Conversation unavailable' };
    }

    const row =
      role === 'mentor'
        ? { mentor_id: currentUserId, student_id: selectedPeerId }
        : { mentor_id: selectedPeerId, student_id: currentUserId };

    const { error } = await supabase.from('chat_messages').insert({
      ...row,
      sender_id: currentUserId,
      message: text,
    });

    if (error) return { ok: false, error: error.message };

    await get().refreshAll();
    return { ok: true };
  },

  sendGroupMessage: async (message) => {
    const text = message.trim();
    if (!text) return { ok: false, error: 'Message cannot be empty' };

    const { mentorId: groupMentorId, currentUserId } = get();
    if (!groupMentorId || !currentUserId) return { ok: false, error: 'Group unavailable' };

    const { error } = await supabase.from('mentor_group_messages').insert({
      mentor_id: groupMentorId,
      sender_id: currentUserId,
      message: text,
    });
    if (error) return { ok: false, error: error.message };

    await get().refreshAll();
    return { ok: true };
  },

  createMeeting: async (input) => {
    const { role, currentUserId, mentorId: userMentorId } = get();
    if (!role || !currentUserId) return { ok: false, error: 'Not authenticated' };

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) return { ok: false, error: 'Invalid date/time' };

    let studentId = currentUserId;
    let resolvedMentorId = userMentorId;
    let status: MeetingEntry['status'] = 'pending';

    if (role === 'mentor') {
      if (!input.studentId) return { ok: false, error: 'Pick a student' };
      studentId = input.studentId;
      resolvedMentorId = currentUserId;
      status = 'approved';
    }

    if (!resolvedMentorId) return { ok: false, error: 'Mentor not assigned' };

    const { error } = await supabase.from('mentor_meetings').insert({
      mentor_id: resolvedMentorId,
      student_id: studentId,
      scheduled_at: scheduledAt.toISOString(),
      status,
      mode: input.mode?.trim() || null,
      meeting_link: input.meetingLink?.trim() || null,
      agenda: input.agenda?.trim() || null,
      created_by: currentUserId,
    });
    if (error) return { ok: false, error: error.message };

    await get().refreshAll();
    return { ok: true };
  },

  reviewMeeting: async (meetingId, status, input) => {
    const { role } = get();
    if (role !== 'mentor') return { ok: false, error: 'Only mentors can review meetings' };

    const payload: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      rejection_reason: status === 'rejected' ? input?.rejectionReason?.trim() || null : null,
    };

    if (status === 'approved') {
      if (input?.scheduledAt) payload.scheduled_at = new Date(input.scheduledAt).toISOString();
      payload.mode = input?.mode?.trim() || null;
      payload.meeting_link = input?.meetingLink?.trim() || null;
      payload.agenda = input?.agenda?.trim() || null;
    }

    const { error } = await supabase.from('mentor_meetings').update(payload).eq('id', meetingId);
    if (error) return { ok: false, error: error.message };

    await get().refreshAll();
    return { ok: true };
  },

  saveMeetingNote: async (meetingId, note) => {
    const { role } = get();
    if (!role) return { ok: false, error: 'Not authenticated' };

    const patch = role === 'mentor' ? { mentor_notes: note.trim() || null } : { student_notes: note.trim() || null };

    const { error } = await supabase.from('mentor_meetings').update(patch).eq('id', meetingId);
    if (error) return { ok: false, error: error.message };

    await get().refreshAll();
    return { ok: true };
  },

  saveYearlyPlan: async (month, subject1, subject2, subject3, notes, explicitTargetStudentId) => {
    const { role, currentUserId, targetStudentId: selectedTarget } = get();
    if (!role || !currentUserId) return { ok: false, error: 'Not authenticated' };

    const ownerId = role === 'mentor' ? explicitTargetStudentId ?? selectedTarget : currentUserId;
    if (!ownerId) return { ok: false, error: 'Choose a student first' };

    const { error } = await supabase
      .from('yearly_plan_entries')
      .upsert(
        {
          user_id: ownerId,
          month: month.trim().toUpperCase(),
          subject_1: subject1.trim() || null,
          subject_2: subject2.trim() || null,
          subject_3: subject3.trim() || null,
          notes: notes.trim() || null,
          student_edit_request_pending: role === 'mentor' ? false : undefined,
          student_edit_request_note: role === 'mentor' ? null : undefined,
          student_edit_request_requested_at: role === 'mentor' ? null : undefined,
          student_edit_request_reviewed_at: role === 'mentor' ? new Date().toISOString() : undefined,
        },
        { onConflict: 'user_id,month' }
      );

    if (error) return { ok: false, error: error.message };
    await get().refreshAll();
    return { ok: true };
  },

  lockYearlyPlan: async (month, explicitTargetStudentId) => {
    const { role, currentUserId, targetStudentId: selectedTarget } = get();
    if (!role || !currentUserId) return { ok: false, error: 'Not authenticated' };

    const ownerId = role === 'mentor' ? explicitTargetStudentId ?? selectedTarget : currentUserId;
    if (!ownerId) return { ok: false, error: 'Choose a student first' };

    const { error } = await supabase
      .from('yearly_plan_entries')
      .update({
        is_locked: true,
        student_edit_request_pending: false,
        student_edit_request_note: null,
        student_edit_request_requested_at: null,
        student_edit_request_reviewed_at: new Date().toISOString(),
      })
      .eq('user_id', ownerId)
      .eq('month', month.trim().toUpperCase());

    if (error) return { ok: false, error: error.message };
    await get().refreshAll();
    return { ok: true };
  },

  requestYearlyEdit: async (month, requestNote) => {
    const { role, currentUserId } = get();
    if (role !== 'student' || !currentUserId) {
      return { ok: false, error: 'Only students can request edits' };
    }

    const { error } = await supabase
      .from('yearly_plan_entries')
      .update({
        student_edit_request_pending: true,
        student_edit_request_note: requestNote.trim() || null,
        student_edit_request_requested_at: new Date().toISOString(),
      })
      .eq('user_id', currentUserId)
      .eq('month', month.trim().toUpperCase());

    if (error) return { ok: false, error: error.message };
    await get().refreshAll();
    return { ok: true };
  },

  approveYearlyEdit: async (month, planOwnerId) => {
    const { role } = get();
    if (role !== 'mentor') return { ok: false, error: 'Only mentors can approve edits' };

    const { error } = await supabase
      .from('yearly_plan_entries')
      .update({
        is_locked: false,
        student_edit_request_pending: false,
        student_edit_request_note: null,
        student_edit_request_requested_at: null,
        student_edit_request_reviewed_at: new Date().toISOString(),
      })
      .eq('user_id', planOwnerId)
      .eq('month', month.trim().toUpperCase());

    if (error) return { ok: false, error: error.message };
    await get().refreshAll();
    return { ok: true };
  },

  setTargetStudent: async (studentId) => {
    set({ targetStudentId: studentId });
    await get().refreshAll();
  },

  upsertResourceMapping: async (rowKey, values) => {
    const { role, targetStudentId } = get();
    if (role !== 'mentor' || !targetStudentId) {
      return { ok: false, error: 'Mentor + target student required' };
    }

    const payload = {
      owner_id: targetStudentId,
      row_key: rowKey,
      resource: values.resource?.trim() || null,
      prelims_pyq_practice: values.prelimsPyqPractice?.trim() || null,
      prelims_test_series: values.prelimsTestSeries?.trim() || null,
      mains_pyq: values.mainsPyq?.trim() || null,
    };

    const { error } = await supabase.from('resource_mapping_values').upsert(payload, {
      onConflict: 'owner_id,row_key',
    });

    if (error) return { ok: false, error: error.message };

    await get().refreshAll();
    return { ok: true };
  },

  assignSchedule: async (input) => {
    const { role } = get();
    if (role !== 'mentor') return { ok: false, error: 'Only mentors can assign schedules' };

    const { error } = await supabase.from('schedule_entries').insert({
      user_id: input.studentId,
      date: input.date,
      subject: input.subject?.trim() || null,
      syllabus: input.syllabus?.trim() || null,
      primary_source: input.primarySource?.trim() || null,
      entry_type: input.entryType ?? 'study',
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  studySessionAction: async (action, payload) => {
    const { currentUserId, role } = get();
    if (role !== 'student' || !currentUserId) return { ok: false, error: 'Only students can use timer' };

    if (action === 'start') {
      if (!payload?.subject) return { ok: false, error: 'Select a subject' };

      const running = get().studySessions.find((s) => s.status === 'active' || s.status === 'paused');
      if (running) return { ok: false, error: 'Stop current session first' };

      const { error } = await supabase.from('study_sessions').insert({
        user_id: currentUserId,
        subject: payload.subject,
        status: 'active',
        started_at: new Date().toISOString(),
        segment_started_at: new Date().toISOString(),
        accumulated_seconds: 0,
      });
      if (error) return { ok: false, error: error.message };
    } else {
      const session = get().studySessions.find((s) => s.id === payload?.sessionId);
      if (!session) return { ok: false, error: 'Session not found' };

      const now = Date.now();
      const segmentStartMs = session.segmentStartedAt ? new Date(session.segmentStartedAt).getTime() : null;
      const segmentDelta = segmentStartMs ? Math.max(0, Math.floor((now - segmentStartMs) / 1000)) : 0;

      if (action === 'pause') {
        if (session.status !== 'active') return { ok: false, error: 'Session not active' };
        const { error } = await supabase
          .from('study_sessions')
          .update({
            status: 'paused',
            segment_started_at: null,
            accumulated_seconds: session.accumulatedSeconds + segmentDelta,
          })
          .eq('id', session.id);
        if (error) return { ok: false, error: error.message };
      }

      if (action === 'resume') {
        if (session.status !== 'paused') return { ok: false, error: 'Session not paused' };
        const { error } = await supabase
          .from('study_sessions')
          .update({ status: 'active', segment_started_at: new Date().toISOString() })
          .eq('id', session.id);
        if (error) return { ok: false, error: error.message };
      }

      if (action === 'stop') {
        if (session.status === 'completed') return { ok: false, error: 'Session already completed' };
        const completedSeconds = session.accumulatedSeconds + (session.status === 'active' ? segmentDelta : 0);
        const { error } = await supabase
          .from('study_sessions')
          .update({
            status: 'completed',
            segment_started_at: null,
            ended_at: new Date().toISOString(),
            accumulated_seconds: completedSeconds,
          })
          .eq('id', session.id);
        if (error) return { ok: false, error: error.message };

        await appendStudyHoursToDailyLog(currentUserId, completedSeconds);
      }
    }

    await get().refreshAll();
    return { ok: true };
  },

  updateGroupLinks: async (telegramGroupLink, whatsappGroupLink) => {
    const { role, currentUserId } = get();
    if (role !== 'mentor' || !currentUserId) {
      return { ok: false, error: 'Only mentors can update group links' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        telegram_group_link: telegramGroupLink.trim() || null,
        whatsapp_group_link: whatsappGroupLink.trim() || null,
      })
      .eq('id', currentUserId);

    if (error) return { ok: false, error: error.message };

    await get().refreshAll();
    return { ok: true };
  },
}));
