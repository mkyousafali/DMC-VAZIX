// ── Shared TypeScript types for DMC-VAZIX ──────────────────────────────────

export type UserRole = 'master_admin' | 'admin' | 'user';

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  created_by: string | null;
}

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
  display_name: string | null;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  entry_date: string;   // ISO date  "YYYY-MM-DD"
  entry_time: string;   // "HH:MM:SS"
  mood_rating: number | null;
  sleep_hours: number | null;
  anxiety_rating: number | null;
  energy_rating: number | null;
  stress_rating: number | null;
  pain_rating: number | null;
  activity: string | null;
  medication_note: string | null;
  trigger_event: string | null;
  general_note: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // joined
  app_users?: { username: string; display_name: string | null };
}

export interface SavedNote {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  is_quick_note: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  id: string;
  user_id: string | null;
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_username: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ── Daily summary computed from entries ───────────────────────────────────
export interface DailySummary {
  date: string;
  count: number;
  avg_mood: number | null;
  min_mood: number | null;
  max_mood: number | null;
  avg_anxiety: number | null;
  avg_energy: number | null;
  avg_stress: number | null;
  avg_pain: number | null;
  sleep_hours: number | null;
}
