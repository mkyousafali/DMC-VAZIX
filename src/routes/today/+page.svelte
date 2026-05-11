<script lang="ts">
  import MoodCard from '$lib/components/MoodCard.svelte';
  import { formatDate, moodColor, avg, round1 } from '$lib/utils';
  import type { PageData } from './$types';

  export let data: PageData;

  $: moods = data.entries.map((e) => e.mood_rating).filter((r): r is number => r !== null);
  $: avgMood = round1(avg(moods));
  $: sleepHours = data.entries.find((e) => e.sleep_hours !== null)?.sleep_hours ?? null;
</script>

<svelte:head>
  <title>Today's Entries — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header flex justify-between items-center">
    <div>
      <h1 class="page-title">📋 Today's Entries</h1>
      <p class="page-subtitle">{formatDate(data.today)}</p>
    </div>
    <a href="/entry" class="btn btn-primary btn-sm">➕ Add</a>
  </div>

  <!-- Summary bar -->
  {#if data.entries.length > 0}
    <div class="summary-bar card mb-md">
      <div class="summary-item">
        <span class="s-val" style="color: {moodColor(avgMood)}">{avgMood ?? '—'}</span>
        <span class="s-label">Avg Mood</span>
      </div>
      <div class="summary-item">
        <span class="s-val" style="color: var(--accent-light)">{data.entries.length}</span>
        <span class="s-label">Entries</span>
      </div>
      {#if sleepHours !== null}
        <div class="summary-item">
          <span class="s-val" style="color: #93c5fd">{sleepHours}h</span>
          <span class="s-label">Sleep</span>
        </div>
      {/if}
      <div class="summary-item">
        <span class="s-val">{moods.length ? Math.min(...moods) : '—'}</span>
        <span class="s-label">Min</span>
      </div>
      <div class="summary-item">
        <span class="s-val">{moods.length ? Math.max(...moods) : '—'}</span>
        <span class="s-label">Max</span>
      </div>
    </div>

    <div class="entries-list">
      {#each data.entries as entry}
        <MoodCard {entry} />
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <div class="icon">📋</div>
      <p>No entries today yet.</p>
      <a href="/entry" class="btn btn-primary mt-md">Add your first entry</a>
    </div>
  {/if}
</div>

<style>
  .summary-bar {
    display: flex;
    justify-content: space-around;
    text-align: center;
    padding: 12px;
  }

  .summary-item { display: flex; flex-direction: column; gap: 2px; }

  .s-val {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
  }

  .s-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .entries-list { display: flex; flex-direction: column; gap: 10px; }
</style>
