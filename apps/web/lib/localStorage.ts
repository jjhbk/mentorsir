import type { IntakeFormData } from "./types";

const ENROLLMENT_DRAFT_KEY = "mentorsir:enrollment_draft";

export function saveEnrollmentDraft(data: Partial<IntakeFormData>): void {
  try {
    localStorage.setItem(ENROLLMENT_DRAFT_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable — silently ignore
  }
}

export function loadEnrollmentDraft(): Partial<IntakeFormData> | null {
  try {
    const raw = localStorage.getItem(ENROLLMENT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<IntakeFormData>;
  } catch {
    return null;
  }
}

export function clearEnrollmentDraft(): void {
  try {
    localStorage.removeItem(ENROLLMENT_DRAFT_KEY);
  } catch {
    // ignore
  }
}
