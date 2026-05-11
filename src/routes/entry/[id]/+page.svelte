<script lang="ts">
  import { enhance } from '$app/forms';
  import RatingSelector from '$lib/components/RatingSelector.svelte';
  import QuickNotes from '$lib/components/QuickNotes.svelte';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let loading = false;

  let entry_date     = data.entry.entry_date;
  let entry_time     = data.entry.entry_time.slice(0, 5);
  let mood_rating:    number | null = data.entry.mood_rating;
  let sleep_hours    = data.entry.sleep_hours !== null ? String(data.entry.sleep_hours) : '';
  let anxiety_rating: number | null = data.entry.anxiety_rating;
  let energy_rating:  number | null = data.entry.energy_rating;
  let stress_rating:  number | null = data.entry.stress_rating;
  let pain_rating:    number | null = data.entry.pain_rating;
  let activity       = data.entry.activity ?? '';
  let medication_note = data.entry.medication_note ?? '';
  let trigger_event  = data.entry.trigger_event ?? '';
  let general_note   = data.entry.general_note ?? '';
  let tags_str       = (data.entry.tags ?? []).join(', ');

  function handleNoteSelect(e: CustomEvent<{ field: string; content: string }>) {
    const { field, content } = e.detail;
    if (field === 'general_note')    general_note    = general_note ? general_note + '\n' + content : content;
    if (field === 'trigger_event')   trigger_event   = content;
    if (field === 'activity')        activity        = content;
    if (field === 'medication_note') medication_note = content;
  }
  function confirmDelete(e: Event) {
    const form = (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement;
    if (confirm('Delete this entry? This cannot be undone.')) form.submit();
  }
</script>

<svelte:head>
  <title>Edit Entry — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header flex justify-between items-center">
    <div>
      <h1 class="page-title">✏️ Edit Entry</h1>
      <p class="page-subtitle">Update your mood entry</p>
    </div>
    <a href="/today" class="btn btn-ghost btn-sm">← Back</a>
  </div>

  {#if form?.error}
    <div class="alert alert-error">{form.error}</div>
  {/if}

  <form method="POST" action="?/update" use:enhance={() => {
    loading = true;
    return async ({ update }) => { loading = false; await update(); };
  }}>
    <div class="card">
      <div class="row-2">
        <div class="form-group">
          <label class="form-label" for="entry_date">📅 Date</label>
          <input id="entry_date" name="entry_date" type="date" class="form-input" bind:value={entry_date} required />
        </div>
        <div class="form-group">
          <label class="form-label" for="entry_time">⏰ Time</label>
          <input id="entry_time" name="entry_time" type="time" class="form-input" bind:value={entry_time} required />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="form-group">
        <RatingSelector label="😊 Mood" name="mood_rating" bind:value={mood_rating} required />
      </div>
      <div class="form-group">
        <label class="form-label" for="sleep_hours">😴 Sleep Hours</label>
        <input id="sleep_hours" name="sleep_hours" type="number" class="form-input" min="0" max="24" step="0.5" placeholder="e.g. 7.5" bind:value={sleep_hours} />
      </div>
    </div>

    <div class="card">
      <div class="form-group"><RatingSelector label="😰 Anxiety" name="anxiety_rating" bind:value={anxiety_rating} /></div>
      <div class="form-group"><RatingSelector label="⚡ Energy"   name="energy_rating"  bind:value={energy_rating} /></div>
      <div class="form-group"><RatingSelector label="🌡️ Stress"  name="stress_rating"  bind:value={stress_rating} /></div>
      <div class="form-group"><RatingSelector label="🩹 Pain"    name="pain_rating"    bind:value={pain_rating} /></div>
    </div>

    <div class="card">
      <div class="form-group">
        <label class="form-label" for="general_note">📝 General Note</label>
        <textarea id="general_note" name="general_note" class="form-textarea" rows="3" bind:value={general_note}></textarea>
        <QuickNotes notes={data.notes} field="general_note" on:select={handleNoteSelect} />
      </div>
      <div class="form-group">
        <label class="form-label" for="trigger_event">⚡ Trigger / Event</label>
        <textarea id="trigger_event" name="trigger_event" class="form-textarea" rows="2" bind:value={trigger_event}></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="activity">🏃 Activity</label>
        <input id="activity" name="activity" type="text" class="form-input" bind:value={activity} />
      </div>
      <div class="form-group">
        <label class="form-label" for="medication_note">💊 Medication Note</label>
        <input id="medication_note" name="medication_note" type="text" class="form-input" bind:value={medication_note} />
      </div>
      <div class="form-group">
        <label class="form-label" for="tags">🏷️ Tags</label>
        <input id="tags" name="tags" type="text" class="form-input" placeholder="comma separated" bind:value={tags_str} />
      </div>
    </div>

    <div class="action-row mt-md">
      <button type="submit" class="btn btn-primary btn-lg flex-1" disabled={loading}>
        {#if loading}<span class="spinner"></span>{:else}💾 Save Changes{/if}
      </button>

      <form method="POST" action="?/delete">
        <button type="submit" class="btn btn-danger btn-lg" on:click|preventDefault={confirmDelete}>🗑️</button>
      </form>
    </div>
  </form>
</div>

<style>
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-group { margin-bottom: 0; }
  .form-group + .form-group { margin-top: 16px; }
  .action-row { display: flex; gap: 12px; }
  form { display: contents; }
</style>
