<script lang="ts">
  import type { SavedNote } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let notes: SavedNote[] = [];
  export let field: string = 'general_note';

  const dispatch = createEventDispatcher<{ select: { field: string; content: string } }>();

  let search = '';
  let showPopup = false;
  let inputEl: HTMLInputElement;

  const fieldCategories: Record<string, string[]> = {
    general_note:    ['mood', 'stress', 'anxiety', 'sleep', 'general'],
    trigger_event:   ['trigger', 'stress', 'mood', 'anxiety'],
    activity:        ['activity'],
    medication_note: ['medication', 'health'],
  };

  $: relevantCategories = fieldCategories[field] ?? [];
  $: quickNotes = notes.filter(
    (n) => n.is_quick_note && relevantCategories.includes(n.category)
  );

  $: popupNotes = notes.filter((n) => {
    if (!search) return true;
    return (
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    );
  });

  function pick(note: SavedNote) {
    dispatch('select', { field, content: note.content });
    search = '';
    showPopup = false;
  }

  function openPopup() {
    search = '';
    showPopup = true;
    setTimeout(() => inputEl?.focus(), 80);
  }

  function closePopup() {
    showPopup = false;
    search = '';
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

  <button type="button" class="search-toggle" on:click={openPopup} title="Search saved notes">
    🔍
  </button>
</div>

<!-- Popup modal -->
{#if showPopup}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="popup-overlay" on:click={closePopup}></div>

  <div class="popup" role="dialog" aria-modal="true">
    <div class="popup-header">
      <span class="popup-title">🔍 Select a note</span>
      <button type="button" class="popup-close" on:click={closePopup}>✕</button>
    </div>

    <div class="popup-search">
      <input
        bind:this={inputEl}
        type="text"
        class="popup-input"
        placeholder="Type to filter notes…"
        bind:value={search}
      />
    </div>

    {#if popupNotes.length > 0}
      <ul class="popup-list">
        {#each popupNotes as note}
          <li>
            <button type="button" class="popup-item" on:click={() => pick(note)}>
              <span class="popup-item-title">{note.title}</span>
              <span class="popup-item-preview">{note.content}</span>
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="popup-empty">No notes match your search.</div>
    {/if}
  </div>
{/if}

<style>
  .quick-notes { margin-top: 6px; }

  .quick-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .quick-pill {
    padding: 5px 13px;
    background: rgba(124,111,247,0.10);
    border: 1px solid rgba(124,111,247,0.30);
    border-radius: var(--radius-full);
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
  }

  .quick-pill:hover {
    background: rgba(124,111,247,0.20);
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(124,111,247,0.20);
  }

  .search-toggle {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* ── Popup overlay ── */
  .popup-overlay {
    position: fixed;
    inset: 0;
    z-index: 299;
    background: rgba(30, 27, 75, 0.35);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* ── Popup panel ── */
  .popup {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 300;
    width: min(92vw, 420px);
    max-height: 75vh;
    display: flex;
    flex-direction: column;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(124,111,247,0.28);
    border-radius: var(--radius-xl);
    box-shadow: 0 16px 48px rgba(124,111,247,0.24), 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
    animation: popIn 0.18s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes popIn {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.94); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid rgba(124,111,247,0.15);
  }

  .popup-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .popup-close {
    background: rgba(124,111,247,0.10);
    border: none;
    color: var(--text-secondary);
    font-size: 0.85rem;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.1s;
  }

  .popup-close:hover { background: rgba(239,68,68,0.12); color: var(--danger); }

  .popup-search {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(124,111,247,0.12);
  }

  .popup-input {
    width: 100%;
    padding: 10px 14px;
    background: rgba(124,111,247,0.07);
    border: 1px solid rgba(124,111,247,0.25);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }

  .popup-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(124,111,247,0.15);
  }

  .popup-list {
    list-style: none;
    margin: 0;
    padding: 6px 0;
    overflow-y: auto;
    flex: 1;
  }

  .popup-item {
    display: block;
    width: 100%;
    padding: 10px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s;
    font-family: var(--font-body);
  }

  .popup-item:hover { background: rgba(124,111,247,0.08); }

  .popup-item-title {
    display: block;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .popup-item-preview {
    display: block;
    font-size: 0.76rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .popup-empty {
    padding: 24px 16px;
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>

