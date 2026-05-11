<script lang="ts">
  import MoodCard from '$lib/components/MoodCard.svelte';
  import { formatDate } from '$lib/utils';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data: PageData;

  let startDate = data.startDate;
  let endDate   = data.endDate;
  let search    = data.search;
  let minMood   = data.minMood ?? '';
  let maxMood   = data.maxMood ?? '';
  let tag       = data.tag;

  function applyFilters() {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate)   params.set('end', endDate);
    if (search)    params.set('q', search);
    if (minMood)   params.set('min_mood', String(minMood));
    if (maxMood)   params.set('max_mood', String(maxMood));
    if (tag)       params.set('tag', tag);
    goto(`/history?${params.toString()}`);
  }

  function clearFilters() {
    startDate = '';
    endDate = '';
    search = '';
    minMood = '';
    maxMood = '';
    tag = '';
    goto('/history');
  }

  // Group entries by date
  $: grouped = data.entries.reduce((acc, entry) => {
    if (!acc[entry.entry_date]) acc[entry.entry_date] = [];
    acc[entry.entry_date].push(entry);
    return acc;
  }, {} as Record<string, typeof data.entries>);

  $: sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
</script>

<svelte:head>
  <title>History — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header">
    <h1 class="page-title">📅 History</h1>
    <p class="page-subtitle">{data.entries.length} entries found</p>
  </div>

  <!-- Filters -->
  <div class="card mb-md">
    <h3 class="font-semibold mb-md text-secondary">🔍 Filters</h3>
    <div class="filter-grid">
      <div class="form-group">
        <label class="form-label" for="start">From</label>
        <input id="start" type="date" class="form-input" bind:value={startDate} />
      </div>
      <div class="form-group">
        <label class="form-label" for="end">To</label>
        <input id="end" type="date" class="form-input" bind:value={endDate} />
      </div>
      <div class="form-group">
        <label class="form-label" for="min_mood">Min Mood</label>
        <input id="min_mood" type="number" class="form-input" min="1" max="10" placeholder="1" bind:value={minMood} />
      </div>
      <div class="form-group">
        <label class="form-label" for="max_mood">Max Mood</label>
        <input id="max_mood" type="number" class="form-input" min="1" max="10" placeholder="10" bind:value={maxMood} />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="search">Search Notes</label>
      <input id="search" type="text" class="form-input" placeholder="Search in notes, activities, triggers…" bind:value={search} />
    </div>
    <div class="form-group">
      <label class="form-label" for="tag">Tag</label>
      <input id="tag" type="text" class="form-input" placeholder="Filter by tag" bind:value={tag} />
    </div>
    <div class="filter-actions">
      <button type="button" class="btn btn-primary flex-1" on:click={applyFilters}>Apply Filters</button>
      <button type="button" class="btn btn-ghost" on:click={clearFilters}>Clear</button>
    </div>
  </div>

  <!-- Results -->
  {#if data.entries.length === 0}
    <div class="empty-state">
      <div class="icon">📭</div>
      <p>No entries match your filters.</p>
      <button class="btn btn-ghost btn-sm mt-md" on:click={clearFilters}>Clear filters</button>
    </div>
  {:else}
    {#each sortedDates as date}
      <div class="day-section">
        <h3 class="day-header">{formatDate(date)} <span class="text-muted text-sm">({grouped[date].length} entries)</span></h3>
        <div class="entries-list">
          {#each grouped[date] as entry}
            <MoodCard {entry} />
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .filter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .filter-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .form-group { margin-bottom: 0; }

  .day-section { margin-bottom: 20px; }

  .day-header {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-secondary);
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 10px;
  }

  .entries-list { display: flex; flex-direction: column; gap: 10px; }
</style>
