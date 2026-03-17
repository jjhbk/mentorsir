"use client";

import { useRef, useState } from "react";

export default function MeetingNotesEditor({
  meetingId,
  defaultNote,
  defaultAudioUrls,
}: {
  meetingId: string;
  defaultNote: string;
  defaultAudioUrls: string[];
}) {
  const [note, setNote] = useState(defaultNote);
  const [audioUrls, setAudioUrls] = useState<string[]>(defaultAudioUrls);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const cleanupStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      cleanupStream();
      setError("Microphone permission denied or unavailable.");
    }
  };

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    setRecording(false);
    mediaRecorderRef.current = null;
    cleanupStream();

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size === 0) {
      setError("No audio captured. Try recording again.");
      return;
    }

    const file = new File([blob], `meeting-note-${Date.now()}.webm`, { type: "audio/webm" });

    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("meetingId", meetingId);
      formData.append("audio", file);

      const response = await fetch("/api/meetings/audio", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | { audioUrl?: string; error?: string }
        | null;

      if (!response.ok || !payload?.audioUrl) {
        throw new Error(payload?.error ?? "Could not upload audio.");
      }

      setAudioUrls((current) => [payload.audioUrl!, ...current]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not upload audio.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("meetingId", meetingId);
      formData.append("note", note);

      const response = await fetch("/api/meetings/notes", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not save note.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save note.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Your Private Notes
      </p>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
        placeholder="Update your notes..."
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={() => void startRecording()}
            disabled={saving}
            className="inline-flex rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            Record Audio
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void stopRecording()}
            disabled={saving}
            className="inline-flex rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            Stop Recording
          </button>
        )}

        <button
          type="button"
          onClick={() => void saveNote()}
          disabled={saving}
          className="inline-flex rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Notes"}
        </button>

      </div>

      {audioUrls.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
            Saved Audio Notes
          </p>
          <div className="space-y-2">
            {audioUrls.map((url, index) => (
              <audio key={`${url}-${index}`} controls src={url} className="w-full" />
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
