<script lang="ts">
  import MoodCard from '$lib/components/MoodCard.svelte';
  import TrendChart from '$lib/components/TrendChart.svelte';
  import { moodColor, moodEmoji, formatDate } from '$lib/utils';
  import type { PageData } from './$types';

  export let data: PageData;

  const today = new Date().toISOString().slice(0, 10);
</script>

<svelte:head>
  <title>Dashboard — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <!-- Welcome -->
  <div class="page-header">
    <h1 class="page-title">
      Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
      {data.user.display_name ?? data.user.username} 👋
    </h1>
    <p class="page-subtitle">{formatDate(today)}</p>
  </div>

  <!-- Quick add button -->
  <a href="/entry" class="btn btn-primary btn-full btn-lg mb-lg">
    ➕ Add Mood Entry
  </a>

  <!-- Today's stats -->
  <div class="stats-grid">
    <div class="stat-card">
      <div
        class="stat-value"
        style="color: {moodColor(data.stats.avg_mood)}"
      >
        {data.stats.avg_mood !== null ? data.stats.avg_mood : '—'}
      </div>
      <div class="stat-label">Avg Mood {moodEmoji(data.stats.avg_mood)}</div>
    </div>

    <div class="stat-card">
      <div class="stat-value" style="color: var(--accent-light)">{data.stats.count}</div>
      <div class="stat-label">Entries Today</div>
    </div>

    <div class="stat-card">
      <div class="stat-value" style="color: var(--text-secondary)">
        {data.stats.min_mood !== null ? data.stats.min_mood : '—'}
        <span style="font-size:1rem;">↕</span>
        {data.stats.max_mood !== null ? data.stats.max_mood : '—'}
      </div>
      <div class="stat-label">Min / Max</div>
    </div>

    <div class="stat-card">
      <div class="stat-value" style="color: #93c5fd">
        {data.stats.sleep_hours !== null ? `${data.stats.sleep_hours}h` : '—'}
      </div>
      <div class="stat-label">Sleep 😴</div>
    </div>
  </div>

  <!-- 7-day trend chart -->
  <div class="card mb-md">
    <div class="flex justify-between items-center mb-md">
      <h2 class="text-lg font-bold">7-Day Mood Trend</h2>
      <a href="/history" class="text-sm text-accent">View history →</a>
    </div>
    <TrendChart data={data.trend} height={140} />
  </div>

  <!-- Recent entries -->
  <div class="section-header">
    <h2 class="text-lg font-bold">Today's Entries</h2>
    <a href="/today" class="text-sm text-accent">View all →</a>
  </div>

  {#if data.entries.length === 0}
    <div class="empty-state">
      <div class="icon">📋</div>
      <p>No entries yet today.</p>
      <a href="/entry" class="btn btn-primary btn-sm mt-md">Add your first entry</a>
    </div>
  {:else}
    <div class="entries-list">
      {#each data.entries as entry}
        <MoodCard {entry} compact />
      {/each}
    </div>
    {#if data.stats.count > 5}
      <a href="/today" class="btn btn-ghost btn-full mt-md">View all {data.stats.count} entries →</a>
    {/if}
  {/if}
</div>

<style>
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
