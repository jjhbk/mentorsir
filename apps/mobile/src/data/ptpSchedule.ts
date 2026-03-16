// PTP 2.0 — 12-week study schedule seed data
// Week 1 starts on the Monday after first login.
// Dates are computed relative to a base date at runtime and stored in Supabase.

export interface ScheduleSeedEntry {
  subject: string;
  syllabus: string;
  primarySource: string;
  entry_type: 'study' | 'ca-test' | 'sectional-test' | 'mentor-connect';
}

// Day template: index 0 = Monday, 6 = Sunday
// 4-month rotation from CLAUDE.md: Modern History → Economy/S&T → Geography/E&E → Polity
const WEEK_TEMPLATE: ScheduleSeedEntry[][] = [
  // Mon
  [
    { subject: 'Modern History', syllabus: '1857 Revolt & Aftermath', primarySource: 'Spectrum', entry_type: 'study' },
    { subject: 'CSAT', syllabus: 'Reading Comprehension Set 1', primarySource: 'CSAT Practice Book', entry_type: 'study' },
  ],
  // Tue
  [
    { subject: 'Modern History', syllabus: 'Social Reform Movements', primarySource: 'Spectrum', entry_type: 'study' },
    { subject: 'Current Affairs', syllabus: 'Monthly Magazine — Week 1', primarySource: 'The Hindu / Magazine', entry_type: 'study' },
  ],
  // Wed
  [
    { subject: 'Modern History', syllabus: 'Governor-Generals & Viceroys', primarySource: 'Spectrum', entry_type: 'study' },
    { subject: 'CSAT', syllabus: 'Quantitative Aptitude Set 1', primarySource: 'CSAT Practice Book', entry_type: 'study' },
  ],
  // Thu
  [
    { subject: 'Modern History', syllabus: 'Nationalist Movement Phase 1', primarySource: 'Spectrum', entry_type: 'study' },
    { subject: 'Current Affairs Test', syllabus: 'Weekly CA Test', primarySource: 'Test Platform', entry_type: 'ca-test' },
  ],
  // Fri
  [
    { subject: 'Modern History', syllabus: 'Revision — Week 1', primarySource: 'Notes', entry_type: 'study' },
    { subject: 'Sectional Test', syllabus: 'Modern History + CSAT Sectional', primarySource: 'Test Platform', entry_type: 'sectional-test' },
  ],
  // Sat
  [
    { subject: 'Modern History', syllabus: 'PYQs — Modern History', primarySource: 'Previous Year Papers', entry_type: 'study' },
    { subject: 'Current Affairs', syllabus: 'Monthly Magazine — Week 2', primarySource: 'The Hindu / Magazine', entry_type: 'study' },
  ],
  // Sun
  [
    { subject: 'Mentor Connect', syllabus: 'Weekly Live Session', primarySource: 'Google Meet / App', entry_type: 'mentor-connect' },
  ],
];

/**
 * Generates 12 weeks of schedule entries starting from `startDate`.
 * Called on first student login when schedule_entries is empty.
 */
export function generatePtpSchedule(
  startDate: string // YYYY-MM-DD — should be nearest Monday
): Array<ScheduleSeedEntry & { date: string; completed: boolean; revision1: boolean; revision2: boolean; revision3: boolean }> {
  const entries: Array<ScheduleSeedEntry & { date: string; completed: boolean; revision1: boolean; revision2: boolean; revision3: boolean }> = [];
  const base = new Date(startDate + 'T00:00:00');

  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(base);
      date.setDate(base.getDate() + week * 7 + day);
      const dateStr = date.toISOString().slice(0, 10);

      WEEK_TEMPLATE[day].forEach((template) => {
        entries.push({
          ...template,
          date: dateStr,
          completed: false,
          revision1: false,
          revision2: false,
          revision3: false,
        });
      });
    }
  }

  return entries;
}

/**
 * Returns the nearest Monday on or after today.
 */
export function nearestMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// Static seed used by useScheduleStore for simplicity —
// generatePtpSchedule is called with nearestMonday() at runtime.
export const ptpScheduleSeed = generatePtpSchedule(nearestMonday());
