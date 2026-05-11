<script lang="ts">
  import type { MoodEntry } from '$lib/types';
  import { formatDate, formatTime, moodColor, moodEmoji } from '$lib/utils';

  export let entry: MoodEntry;
  export let showActions = true;
  export let compact = false;

  function confirmDelete(e: Event) {
    const form = (e.target as HTMLElement).closest('form') as HTMLFormElement;
    if (confirm('Delete this entry?')) form.submit();
  }
</script>

<div class="mood-card" class:compact>
  <!-- Header row -->
  <div class="card-header">
    <div class="time-info">
      <span class="entry-time">{formatTime(entry.entry_time)}</span>
      {#if !compact}
        <span class="entry-date text-xs text-muted">{formatDate(entry.entry_date)}</span>
      {/if}
    </div>

    {#if entry.mood_rating !== null}
      <div class="mood-badge" style="background: {moodColor(entry.mood_rating)}22; border-color: {moodColor(entry.mood_rating)}; color: {moodColor(entry.mood_rating)}">
        {moodEmoji(entry.mood_rating)} {entry.mood_rating}/10
      </div>
    {/if}
  </div>

  <!-- Metrics row -->
  {#if !compact}
    <div class="metrics-row">
      {#if entry.sleep_hours !== null}
        <div class="metric"><span class="m-icon">😴</span><span>{entry.sleep_hours}h</span></div>
      {/if}
      {#if entry.anxiety_rating !== null}
        <div class="metric"><span class="m-icon">😰</span><span style="color:{moodColor(11 - entry.anxiety_rating)}">{entry.anxiety_rating}</span></div>
      {/if}
      {#if entry.energy_rating !== null}
        <div class="metric"><span class="m-icon">⚡</span><span style="color:{moodColor(entry.energy_rating)}">{entry.energy_rating}</span></div>
      {/if}
      {#if entry.stress_rating !== null}
        <div class="metric"><span class="m-icon">🌡️</span><span style="color:{moodColor(11 - entry.stress_rating)}">{entry.stress_rating}</span></div>
      {/if}
      {#if entry.pain_rating !== null}
        <div class="metric"><span class="m-icon">🩹</span><span style="color:{moodColor(11 - entry.pain_rating)}">{entry.pain_rating}</span></div>
      {/if}
    </div>
  {/if}

  <!-- Notes -->
  {#if entry.general_note}
    <p class="note-text">{entry.general_note}</p>
  {/if}

  {#if !compact}
    {#if entry.activity}
      <div class="detail-row"><span class="detail-icon">🏃</span>{entry.activity}</div>
    {/if}
    {#if entry.trigger_event}
      <div class="detail-row"><span class="detail-icon">⚡</span>{entry.trigger_event}</div>
    {/if}
    {#if entry.medication_note}
      <div class="detail-row"><span class="detail-icon">💊</span>{entry.medication_note}</div>
    {/if}

    {#if entry.tags.length > 0}
      <div class="tags mt-sm">
        {#each entry.tags as tag}
          <span class="tag">#{tag}</span>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Actions -->
  {#if showActions}
    <div class="card-actions">
      <a href="/entry/{entry.id}" class="btn btn-ghost btn-sm">✏️ Edit</a>
      <form method="POST" action="/entry/{entry.id}?/delete" on:submit|preventDefault={confirmDelete}>
        <button type="submit" class="btn btn-ghost btn-sm text-danger">🗑️ Delete</button>
      </form>
    </div>
  {/if}
</div>

<style>
  .mood-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    transition: border-color 0.15s;
  }

  .mood-card:hover { border-color: var(--border-hover); }

  .mood-card.compact { padding: 10px 14px; }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .time-info {
    display: flex;
    flex-direction: column;
  }

  .entry-time {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .mood-badge {
    padding: 4px 10px;
    border: 1.5px solid;
    border-radius: var(--radius-full);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .metrics-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 8px;
  }

  .metric {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .m-icon { font-size: 1rem; }

  .note-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .detail-icon { font-size: 0.9rem; }

  .card-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  form { display: contents; }
</style>
