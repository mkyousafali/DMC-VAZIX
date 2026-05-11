// ── Utility helpers for DMC-VAZIX ─────────────────────────────────────────

/** Returns today's date as "YYYY-MM-DD" in the local timezone */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns current time as "HH:MM" */
export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Format a date string "YYYY-MM-DD" to human readable "Mon DD, YYYY" */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/** Format "HH:MM:SS" to "HH:MM AM/PM" */
export function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Return colour class based on rating 1-10 */
export function moodColor(rating: number | null): string {
  if (rating === null) return '#64748b';
  if (rating <= 2)  return '#dc2626';
  if (rating <= 4)  return '#f97316';
  if (rating <= 6)  return '#eab308';
  if (rating <= 8)  return '#22c55e';
  return '#16a34a';
}

/** Return emoji based on mood rating */
export function moodEmoji(rating: number | null): string {
  if (rating === null) return '—';
  if (rating <= 2)  return '😞';
  if (rating <= 4)  return '😕';
  if (rating <= 6)  return '😐';
  if (rating <= 8)  return '🙂';
  return '😄';
}

/** Round to 1 decimal */
export function round1(n: number | null | undefined): number | null {
  if (n === null || n === undefined) return null;
  return Math.round(n * 10) / 10;
}

/** Safe average of an array ignoring nulls */
export function avg(arr: (number | null)[]): number | null {
  const vals = arr.filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return round1(vals.reduce((s, v) => s + v, 0) / vals.length);
}

/** Parse comma/space-separated tags string into array */
export function parseTags(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/** Generate a date range array from start to end inclusive */
export function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Get YYYY-MM-DD for N days ago */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
