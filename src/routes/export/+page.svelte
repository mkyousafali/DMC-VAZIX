<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatDate } from '$lib/utils';
  import type { PageData } from './$types';

  export let data: PageData;

  let startDate = data.startDate;
  let endDate   = data.endDate;
  let selectedUserId = data.targetUser?.id ?? data.user.id;

  let exporting = false;
  let error = '';

  function applyFilters() {
    const params = new URLSearchParams({ start: startDate, end: endDate });
    if (data.user.role === 'master_admin' && selectedUserId !== data.user.id) {
      params.set('user_id', selectedUserId);
    }
    goto(`/export?${params.toString()}`);
  }

  async function exportPDF() {
    if (data.entries.length === 0) {
      error = 'No entries in the selected range. Adjust the date filters.';
      return;
    }
    exporting = true;
    error = '';
    try {
      const { exportPDF: generate } = await import('$lib/pdf');
      await generate({
        username:    data.targetUser?.username ?? data.user.username,
        displayName: data.targetUser?.display_name ?? data.user.display_name,
        startDate,
        endDate,
        entries:     data.entries
      });
    } catch (e) {
      error = 'PDF generation failed. Please try again.';
      console.error(e);
    } finally {
      exporting = false;
    }
  }
</script>

<svelte:head>
  <title>Export Report — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header">
    <h1 class="page-title">📄 Export PDF Report</h1>
    <p class="page-subtitle">Therapist-friendly Daily Mood Chart</p>
  </div>

  {#if error}
    <div class="alert alert-error">{error}</div>
  {/if}

  <div class="card mb-md">
    <h3 class="font-semibold mb-md text-secondary">⚙️ Report Settings</h3>

    <!-- Admin: user picker -->
    {#if data.user.role === 'master_admin' && data.users.length > 0}
      <div class="form-group">
        <label class="form-label" for="user_select">Patient</label>
        <select id="user_select" class="form-select" bind:value={selectedUserId}>
          {#each data.users as u}
            <option value={u.id}>{u.display_name ?? u.username}</option>
          {/each}
        </select>
      </div>
    {/if}

    <div class="filter-row">
      <div class="form-group">
        <label class="form-label" for="start">From Date</label>
        <input id="start" type="date" class="form-input" bind:value={startDate} />
      </div>
      <div class="form-group">
        <label class="form-label" for="end">To Date</label>
        <input id="end" type="date" class="form-input" bind:value={endDate} />
      </div>
    </div>

    <button type="button" class="btn btn-ghost btn-full" on:click={applyFilters}>
      🔄 Load Data
    </button>
  </div>

  <!-- Preview summary -->
  {#if data.targetUser}
    <div class="card mb-md">
      <h3 class="font-semibold mb-md">📋 Report Preview</h3>
      <div class="preview-info">
        <div class="preview-row">
          <span class="text-muted">Patient</span>
          <span>{data.targetUser.display_name ?? data.targetUser.username}</span>
        </div>
        <div class="preview-row">
          <span class="text-muted">Period</span>
          <span>{formatDate(startDate)} → {formatDate(endDate)}</span>
        </div>
        <div class="preview-row">
          <span class="text-muted">Total entries</span>
          <span style="font-weight:700; color: var(--accent-light)">{data.entries.length}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Export button -->
  <button
    type="button"
    class="btn btn-primary btn-full btn-lg"
    disabled={exporting || data.entries.length === 0}
    on:click={exportPDF}
  >
    {#if exporting}
      <span class="spinner"></span> Generating PDF…
    {:else}
      📥 Export PDF Report ({data.entries.length} entries)
    {/if}
  </button>

  {#if data.entries.length === 0}
    <div class="empty-state mt-lg">
      <div class="icon">📭</div>
      <p>No entries in selected range.</p>
    </div>
  {/if}
</div>

<style>
  .filter-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .form-group { margin-bottom: 0; }

  .preview-info { display: flex; flex-direction: column; gap: 8px; }

  .preview-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
  }

  .preview-row:last-child { border-bottom: none; }
</style>
