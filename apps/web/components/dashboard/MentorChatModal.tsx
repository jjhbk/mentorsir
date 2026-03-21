"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type RoleLabel = "student" | "mentor" | "admin" | string;

interface ChatPeer {
  id: string;
  name: string | null;
  mobile: string | null;
  telegramId: string | null;
  unreadCount?: number;
  kind: "student" | "mentor";
}

interface ChatMessage {
  id: string;
  mentorId: string;
  studentId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface GroupMessage {
  id: string;
  mentorId: string;
  senderId: string;
  senderName: string | null;
  message: string;
  createdAt: string;
}

interface ConversationPayload {
  role: "student" | "mentor";
  mentorId: string;
  studentId: string;
  messages: ChatMessage[];
}

export default function MentorChatModal({
  open,
  onClose,
  onSyncUnread,
  roleLabel,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  onSyncUnread?: () => void;
  roleLabel: RoleLabel;
  currentUserId: string;
}) {
  const [peers, setPeers] = useState<ChatPeer[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mentorId, setMentorId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [groupDraft, setGroupDraft] = useState("");
  const [groupMentorId, setGroupMentorId] = useState<string>("");
  const [groupTelegramLink, setGroupTelegramLink] = useState<string | null>(null);
  const [groupWhatsappLink, setGroupWhatsappLink] = useState<string | null>(null);
  const [groupTelegramInput, setGroupTelegramInput] = useState("");
  const [groupWhatsappInput, setGroupWhatsappInput] = useState("");
  const [savingGroupLinks, setSavingGroupLinks] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [sendingGroup, setSendingGroup] = useState(false);
  const [activeMode, setActiveMode] = useState<"private" | "group">("private");
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const groupEndRef = useRef<HTMLDivElement | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const selectedPeer = peers.find((peer) => peer.id === selectedPeerId) ?? null;
  const isMentor = roleLabel === "mentor";

  const fetchPeers = useCallback(async () => {
    const response = await fetch("/api/chat/peers", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | { peers?: ChatPeer[]; error?: string; totalUnread?: number }
      | null;
    if (!response.ok) {
      setError(payload?.error ?? "Could not load chat contacts.");
      return;
    }
    const nextPeers = payload?.peers ?? [];
    setPeers(nextPeers);
    setSelectedPeerId((prev) => {
      if (prev && nextPeers.some((peer) => peer.id === prev)) return prev;
      return nextPeers[0]?.id || "";
    });
  }, []);

  const fetchMessages = useCallback(async (peerId: string) => {
    const response = await fetch(`/api/chat/messages?peerId=${encodeURIComponent(peerId)}`, {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | (ConversationPayload & { error?: string })
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not load messages.");
      return;
    }

    if (payload) {
      setMentorId(payload.mentorId);
      setStudentId(payload.studentId);
      setMessages(payload.messages ?? []);
    }
  }, []);

  const fetchGroupMessages = useCallback(async () => {
    const response = await fetch("/api/chat/group", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | {
          mentorId?: string;
          telegramGroupLink?: string | null;
          whatsappGroupLink?: string | null;
          messages?: GroupMessage[];
          error?: string;
        }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not load group chat.");
      return;
    }

    setGroupMentorId(payload?.mentorId ?? "");
    setGroupTelegramLink(payload?.telegramGroupLink ?? null);
    setGroupWhatsappLink(payload?.whatsappGroupLink ?? null);
    setGroupTelegramInput(payload?.telegramGroupLink ?? "");
    setGroupWhatsappInput(payload?.whatsappGroupLink ?? "");
    setGroupMessages(payload?.messages ?? []);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function loadPeers() {
      setLoadingPeers(true);
      setLoadingGroup(true);
      setError(null);
      if (!cancelled) await fetchPeers();
      if (!cancelled) await fetchGroupMessages();
      setLoadingPeers(false);
      setLoadingGroup(false);
    }

    loadPeers();
    return () => {
      cancelled = true;
    };
  }, [open, fetchPeers, fetchGroupMessages]);

  useEffect(() => {
    if (!open || !selectedPeerId) return;
    let cancelled = false;

    async function loadMessages() {
      setLoadingMessages(true);
      setError(null);
      if (!cancelled) await fetchMessages(selectedPeerId);
      setLoadingMessages(false);
    }

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [open, selectedPeerId, fetchMessages]);

  useEffect(() => {
    if (!open || !mentorId || !studentId) return;
    const channel = supabase
      .channel(`chat:${mentorId}:${studentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (
          payload: RealtimePostgresInsertPayload<{
            id: string;
            mentor_id: string;
            student_id: string;
            sender_id: string;
            message: string;
            created_at: string;
          }>
        ) => {
          const row = payload.new;
          const normalized: ChatMessage = {
            id: row.id,
            mentorId: row.mentor_id,
            studentId: row.student_id,
            senderId: row.sender_id,
            message: row.message,
            createdAt: row.created_at,
          };
          const sameConversation =
            normalized.mentorId === mentorId && normalized.studentId === studentId;
          if (!sameConversation) return;
          setMessages((prev) => {
            if (prev.some((message) => message.id === normalized.id)) return prev;
            return [...prev, normalized];
          });
          onSyncUnread?.();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, mentorId, studentId, supabase, onSyncUnread]);

  useEffect(() => {
    if (!open || !groupMentorId) return;
    const channel = supabase
      .channel(`group-chat:${groupMentorId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mentor_group_messages", filter: `mentor_id=eq.${groupMentorId}` },
        (
          payload: RealtimePostgresInsertPayload<{
            id: string;
            mentor_id: string;
            sender_id: string;
            message: string;
            created_at: string;
          }>
        ) => {
          const row = payload.new;
          const normalized: GroupMessage = {
            id: row.id,
            mentorId: row.mentor_id,
            senderId: row.sender_id,
            senderName: null,
            message: row.message,
            createdAt: row.created_at,
          };
          setGroupMessages((prev) => {
            if (prev.some((message) => message.id === normalized.id)) return prev;
            return [...prev, normalized];
          });
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, groupMentorId, supabase]);

  useEffect(() => {
    if (!open || !selectedPeerId) return;
    const interval = setInterval(() => {
      void fetchMessages(selectedPeerId);
      void fetchGroupMessages();
    }, 15000);
    return () => clearInterval(interval);
  }, [open, selectedPeerId, fetchMessages, fetchGroupMessages]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    groupEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages, open]);

  async function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed || !selectedPeerId) return;

    setSending(true);
    setError(null);
    const response = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        peerId: selectedPeerId,
        message: trimmed,
      }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { message?: ChatMessage; error?: string }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not send message.");
      setSending(false);
      return;
    }

    const nextMessage = payload?.message;
    if (nextMessage) {
      setMessages((prev) => {
        if (prev.some((message) => message.id === nextMessage.id)) return prev;
        return [...prev, nextMessage];
      });
    }
    setDraft("");
    setSending(false);
  }

  async function sendGroupMessage() {
    const trimmed = groupDraft.trim();
    if (!trimmed) return;

    setSendingGroup(true);
    setError(null);
    const response = await fetch("/api/chat/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { message?: GroupMessage; error?: string }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not send group message.");
      setSendingGroup(false);
      return;
    }

    const nextMessage = payload?.message;
    if (nextMessage) {
      setGroupMessages((prev) => {
        if (prev.some((message) => message.id === nextMessage.id)) return prev;
        return [...prev, nextMessage];
      });
    }
    setGroupDraft("");
    setSendingGroup(false);
  }

  async function saveGroupLinks() {
    if (!isMentor) return;
    setSavingGroupLinks(true);
    setError(null);
    const response = await fetch("/api/chat/group/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegramGroupLink: groupTelegramInput,
        whatsappGroupLink: groupWhatsappInput,
      }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { telegramGroupLink?: string | null; whatsappGroupLink?: string | null; error?: string }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not save group links.");
      setSavingGroupLinks(false);
      return;
    }

    setGroupTelegramLink(payload?.telegramGroupLink ?? null);
    setGroupWhatsappLink(payload?.whatsappGroupLink ?? null);
    setSavingGroupLinks(false);
  }

  if (!open) return null;

  const whatsappHref =
    selectedPeer?.mobile && (isMentor || selectedPeer.kind === "mentor")
      ? `https://wa.me/${selectedPeer.mobile.replace(/\D/g, "")}`
      : null;
  const telegramHref =
    selectedPeer?.telegramId && (isMentor || selectedPeer.kind === "mentor")
      ? `https://t.me/${selectedPeer.telegramId.replace(/^@/, "")}`
      : null;
  const groupTelegramHref = groupTelegramLink?.trim() ? groupTelegramLink.trim() : null;
  const groupWhatsappHref = groupWhatsappLink?.trim() ? groupWhatsappLink.trim() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              {isMentor ? "Student Chats" : "Talk to Mentor"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text">
              {activeMode === "private" ? "1:1 Chat" : "Mentor Group Chat"}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {activeMode === "private"
                ? isMentor
                  ? "Select a student and chat in real time."
                  : "Direct private chat with your assigned mentor."
                : "Shared discussion space for mentor and all assigned students."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMode("private")}
            className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
              activeMode === "private"
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-text"
            }`}
          >
            1:1 Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("group")}
            className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
              activeMode === "group"
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-text"
            }`}
          >
            Buddy Chat
          </button>
        </div>

        {activeMode === "private" ? (
        <div className="mt-5 grid gap-3 md:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border border-border bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              {isMentor ? "Students" : "Mentor"}
            </p>
            {loadingPeers ? (
              <p className="mt-3 text-xs text-text-muted">Loading contacts...</p>
            ) : peers.length === 0 ? (
              <p className="mt-3 text-xs text-text-muted">No chat contact available yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {peers.map((peer) => {
                  const active = selectedPeerId === peer.id;
                  return (
                    <button
                      key={peer.id}
                      type="button"
                      onClick={() => setSelectedPeerId(peer.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        active
                          ? "border-primary bg-white text-text"
                          : "border-border bg-white text-text-muted hover:border-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">{peer.name ?? "Unnamed"}</p>
                        {(peer.unreadCount ?? 0) > 0 ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                            {peer.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs">{peer.mobile ?? "No phone"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-text">{selectedPeer?.name ?? "Select a contact"}</p>
                <p className="text-xs text-text-muted">{selectedPeer?.mobile ?? ""}</p>
              </div>
              <div className="flex items-center gap-2">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-[#25D366] transition hover:border-[#25D366]"
                    title="Open WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 12.041 2C7.65 2 4.07 5.58 4.07 9.972c0 1.4.366 2.768 1.062 3.976L4 18l4.159-1.09a7.9 7.9 0 0 0 3.882 1.017h.003c4.39 0 7.97-3.58 7.97-7.972a7.93 7.93 0 0 0-2.413-5.629zM12.044 16.5h-.002a6.5 6.5 0 0 1-3.313-.908l-.237-.14-2.469.647.659-2.407-.154-.247a6.48 6.48 0 0 1-.995-3.473c0-3.584 2.924-6.5 6.517-6.5a6.47 6.47 0 0 1 4.622 1.91 6.46 6.46 0 0 1 1.91 4.607c-.001 3.584-2.925 6.511-6.538 6.511zm3.558-4.844c-.195-.098-1.154-.57-1.333-.635-.18-.066-.31-.098-.44.098-.13.196-.505.635-.619.766-.114.13-.228.147-.423.049-.195-.098-.823-.303-1.568-.967-.58-.517-.971-1.154-1.085-1.35-.114-.196-.012-.302.086-.4.088-.087.195-.228.293-.342.098-.114.13-.196.195-.326.065-.131.033-.245-.016-.343-.049-.098-.44-1.06-.603-1.452-.159-.382-.32-.33-.44-.336l-.375-.006a.72.72 0 0 0-.522.245c-.18.196-.685.668-.685 1.63s.701 1.891.799 2.022c.098.13 1.38 2.107 3.344 2.954.467.201.832.321 1.116.411.469.149.896.128 1.234.078.376-.056 1.154-.472 1.317-.929.163-.457.163-.848.114-.929-.049-.081-.179-.13-.374-.228z" />
                    </svg>
                  </a>
                ) : null}
                {telegramHref ? (
                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-[#229ED9] transition hover:border-[#229ED9]"
                    title="Open Telegram"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M21.5 4.6 18.4 19c-.2 1-.8 1.3-1.6.8l-4.5-3.4-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.7 8.6-7.8c.4-.4-.1-.5-.6-.2L6.8 13 2.4 11.6c-1-.3-1-.9.2-1.4l17-6.6c.8-.3 1.5.2 1.3 1Z" />
                    </svg>
                  </a>
                ) : null}
              </div>
            </div>

            <div className="h-[360px] overflow-y-auto px-4 py-3">
              {loadingMessages ? (
                <p className="text-xs text-text-muted">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-xs text-text-muted">No messages yet. Start the conversation.</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const mine = message.senderId === currentUserId;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            mine ? "bg-primary text-white" : "border border-border bg-surface text-text"
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`mt-1 text-[11px] ${mine ? "text-white/80" : "text-text-muted"}`}>
                            {new Date(message.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  disabled={!selectedPeerId || sending}
                  placeholder={selectedPeerId ? "Type a message..." : "Select a contact first"}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || !selectedPeerId || sending}
                  className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
              {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
            </div>
          </div>
        </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-text">Mentor Group Chat</p>
                <p className="text-xs text-text-muted">
                  Mentor + all assigned students
                </p>
              </div>
              <div className="flex items-center gap-2">
                {groupWhatsappHref ? (
                  <a
                    href={groupWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-[#25D366] transition hover:border-[#25D366]"
                    title="Open WhatsApp Group"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 12.041 2C7.65 2 4.07 5.58 4.07 9.972c0 1.4.366 2.768 1.062 3.976L4 18l4.159-1.09a7.9 7.9 0 0 0 3.882 1.017h.003c4.39 0 7.97-3.58 7.97-7.972a7.93 7.93 0 0 0-2.413-5.629zM12.044 16.5h-.002a6.5 6.5 0 0 1-3.313-.908l-.237-.14-2.469.647.659-2.407-.154-.247a6.48 6.48 0 0 1-.995-3.473c0-3.584 2.924-6.5 6.517-6.5a6.47 6.47 0 0 1 4.622 1.91 6.46 6.46 0 0 1 1.91 4.607c-.001 3.584-2.925 6.511-6.538 6.511zm3.558-4.844c-.195-.098-1.154-.57-1.333-.635-.18-.066-.31-.098-.44.098-.13.196-.505.635-.619.766-.114.13-.228.147-.423.049-.195-.098-.823-.303-1.568-.967-.58-.517-.971-1.154-1.085-1.35-.114-.196-.012-.302.086-.4.088-.087.195-.228.293-.342.098-.114.13-.196.195-.326.065-.131.033-.245-.016-.343-.049-.098-.44-1.06-.603-1.452-.159-.382-.32-.33-.44-.336l-.375-.006a.72.72 0 0 0-.522.245c-.18.196-.685.668-.685 1.63s.701 1.891.799 2.022c.098.13 1.38 2.107 3.344 2.954.467.201.832.321 1.116.411.469.149.896.128 1.234.078.376-.056 1.154-.472 1.317-.929.163-.457.163-.848.114-.929-.049-.081-.179-.13-.374-.228z" />
                    </svg>
                  </a>
                ) : null}
                {groupTelegramHref ? (
                  <a
                    href={groupTelegramHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-[#229ED9] transition hover:border-[#229ED9]"
                    title="Open Telegram Group"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M21.5 4.6 18.4 19c-.2 1-.8 1.3-1.6.8l-4.5-3.4-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.7 8.6-7.8c.4-.4-.1-.5-.6-.2L6.8 13 2.4 11.6c-1-.3-1-.9.2-1.4l17-6.6c.8-.3 1.5.2 1.3 1Z" />
                    </svg>
                  </a>
                ) : null}
              </div>
            </div>

            {isMentor ? (
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Group Link Settings
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    value={groupTelegramInput}
                    onChange={(event) => setGroupTelegramInput(event.target.value)}
                    placeholder="Telegram group link"
                    className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                  />
                  <input
                    value={groupWhatsappInput}
                    onChange={(event) => setGroupWhatsappInput(event.target.value)}
                    placeholder="WhatsApp group link"
                    className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void saveGroupLinks()}
                  disabled={savingGroupLinks}
                  className="mt-2 inline-flex rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-text disabled:opacity-50"
                >
                  {savingGroupLinks ? "Saving..." : "Save Group Links"}
                </button>
              </div>
            ) : null}

            <div className="h-[360px] overflow-y-auto px-4 py-3">
              {loadingGroup ? (
                <p className="text-xs text-text-muted">Loading group messages...</p>
              ) : groupMessages.length === 0 ? (
                <p className="text-xs text-text-muted">No group messages yet. Start the discussion.</p>
              ) : (
                <div className="space-y-2">
                  {groupMessages.map((message) => {
                    const mine = message.senderId === currentUserId;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            mine ? "bg-primary text-white" : "border border-border bg-surface text-text"
                          }`}
                        >
                          {!mine ? (
                            <p className="text-[11px] font-semibold text-text-muted">
                              {message.senderName ?? "Member"}
                            </p>
                          ) : null}
                          <p>{message.message}</p>
                          <p className={`mt-1 text-[11px] ${mine ? "text-white/80" : "text-text-muted"}`}>
                            {new Date(message.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={groupEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendGroupMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={groupDraft}
                  onChange={(event) => setGroupDraft(event.target.value)}
                  disabled={sendingGroup}
                  placeholder="Type a group message..."
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                />
                <button
                  type="submit"
                  disabled={!groupDraft.trim() || sendingGroup}
                  className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
              {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
