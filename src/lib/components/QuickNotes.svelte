<script lang="ts">
  import type { SavedNote } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let notes: SavedNote[] = [];
  export let field: string = 'general_note'; // which form field to fill

  const dispatch = createEventDispatcher<{ select: { field: string; content: string } }>();

  let search = '';
  let showSearch = false;

  // Default quick-note presets shown as pills
  const quickNotes: SavedNote[] = notes.filter((n) => n.is_quick_note);
  const customNotes: SavedNote[] = notes.filter((n) => !n.is_quick_note);

  $: filtered = search.length > 0
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    : customNotes;

  function pick(note: SavedNote) {
    dispatch('select', { field, content: note.content });
    search = '';
    showSearch = false;
  }
</script>

<div class="quick-notes">
  <!-- Quick note pills -->
  {#if quickNotes.length > 0}
    <div class="quick-pills">
      {#each quickNotes as note}
        <button type="button" class="quick-pill" on:click={() => pick(note)}>
          {note.title}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Search saved notes -->
  <button
    type="button"
    class="search-toggle"
    on:click={() => { showSearch = !showSearch; search = ''; }}
  >
    {showSearch ? '✕ Close' : '🔍 Search saved notes'}
  </button>

  {#if showSearch}
    <div class="note-search-panel">
      <input
        type="text"
        class="form-input"
        placeholder="Search notes…"
        bind:value={search}
        autofocus
      />
      {#if filtered.length > 0}
        <ul class="note-list">
          {#each filtered as note}
            <li>
              <button type="button" class="note-item" on:click={() => pick(note)}>
                <span class="note-title">{note.title}</span>
                <span class="note-preview">{note.content}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-muted text-sm" style="padding: 8px 0;">No notes found.</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .quick-notes { margin-top: 6px; }

  .quick-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .quick-pill {
    padding: 5px 12px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
  }

  .quick-pill:hover {
    border-color: var(--accent);
    color: var(--accent-light);
    background: rgba(99,102,241,0.1);
  }

  .search-toggle {
    background: none;
    border: none;
    color: var(--accent-light);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }

  .note-search-panel {
    margin-top: 8px;
  }

  .note-list {
    list-style: none;
    margin-top: 6px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }

  .note-item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s;
  }

  .note-item:hover { background: var(--bg-elevated); }

  li + li .note-item { border-top: 1px solid var(--border); }

  .note-title {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .note-preview {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
