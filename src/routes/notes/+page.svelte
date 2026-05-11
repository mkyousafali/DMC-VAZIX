<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let showForm = false;
  let title = '';
  let content = '';
  let category = 'general';
  let is_quick = false;
  let saving = false;

  const categories = ['general', 'mood', 'sleep', 'anxiety', 'stress', 'activity', 'trigger', 'health', 'medication'];

  $: quickNotes = data.notes.filter((n) => n.is_quick_note);
  $: savedNotes = data.notes.filter((n) => !n.is_quick_note);

  function confirmDelete(e: Event) {
    const btn = e.target as HTMLElement;
    const frm = btn.closest('form') as HTMLFormElement;
    if (confirm('Delete this note?')) frm.submit();
  }
</script>

<svelte:head>
  <title>Saved Notes — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header flex justify-between items-center">
    <div>
      <h1 class="page-title">📝 Saved Notes</h1>
      <p class="page-subtitle">{data.notes.length} notes saved</p>
    </div>
    <button class="btn btn-primary btn-sm" on:click={() => (showForm = !showForm)}>
      {showForm ? '✕ Cancel' : '➕ New'}
    </button>
  </div>

  {#if form?.error}
    <div class="alert alert-error">{form.error}</div>
  {/if}

  <!-- Create form -->
  {#if showForm}
    <div class="card mb-md">
      <h3 class="font-semibold mb-md">Create Note</h3>
      <form method="POST" action="?/create" use:enhance={() => {
        saving = true;
        return async ({ update }) => { saving = false; showForm = false; await update(); };
      }}>
        <div class="form-group">
          <label class="form-label" for="title">Title</label>
          <input id="title" name="title" type="text" class="form-input" required bind:value={title} />
        </div>
        <div class="form-group">
          <label class="form-label" for="content">Content</label>
          <textarea id="content" name="content" class="form-textarea" required rows="2" bind:value={content}></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="category">Category</label>
          <select id="category" name="category" class="form-select" bind:value={category}>
            {#each categories as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
        <div class="form-group flex items-center gap-sm">
          <input id="is_quick" name="is_quick_note" type="checkbox" bind:checked={is_quick} />
          <label for="is_quick" class="form-label" style="margin:0">Show as quick-note button</label>
        </div>
        <button type="submit" class="btn btn-primary btn-full mt-md" disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Note'}
        </button>
      </form>
    </div>
  {/if}

  <!-- Quick notes -->
  {#if quickNotes.length > 0}
    <h2 class="section-title">⚡ Quick Notes</h2>
    <div class="notes-grid mb-md">
      {#each quickNotes as note}
        <div class="note-card quick">
          <div class="note-top">
            <span class="note-title">{note.title}</span>
            <span class="tag">{note.category}</span>
          </div>
          <p class="note-content">{note.content}</p>
          <div class="note-footer">
            <span class="text-xs text-muted">Used {note.use_count}×</span>
            <form method="POST" action="?/delete">
              <input type="hidden" name="id" value={note.id} />
              <button type="submit" class="del-btn" on:click|preventDefault={confirmDelete}>🗑️</button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Saved notes -->
  <h2 class="section-title">📋 All Saved Notes</h2>
  {#if savedNotes.length === 0}
    <div class="empty-state">
      <div class="icon">📝</div>
      <p>No saved notes yet. Create reusable notes above.</p>
    </div>
  {:else}
    <div class="notes-grid">
      {#each savedNotes as note}
        <div class="note-card">
          <div class="note-top">
            <span class="note-title">{note.title}</span>
            <span class="tag">{note.category}</span>
          </div>
          <p class="note-content">{note.content}</p>
          <div class="note-footer">
            <span class="text-xs text-muted">Used {note.use_count}×</span>
            <form method="POST" action="?/delete">
              <input type="hidden" name="id" value={note.id} />
              <button type="submit" class="del-btn" on:click|preventDefault={confirmDelete}>🗑️</button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .section-title {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }

  .note-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .note-card.quick { border-color: var(--accent); background: rgba(99,102,241,0.05); }

  .note-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 4px;
  }

  .note-title { font-weight: 700; font-size: 0.85rem; }

  .note-content {
    font-size: 0.8rem;
    color: var(--text-secondary);
    flex: 1;
    line-height: 1.4;
  }

  .note-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .del-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    opacity: 0.5;
    padding: 0;
  }
  .del-btn:hover { opacity: 1; }

  form { display: contents; }
  .form-group { margin-bottom: 10px; }
</style>
