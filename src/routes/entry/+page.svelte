<script lang="ts">
  import { enhance } from '$app/forms';
  import RatingSelector from '$lib/components/RatingSelector.svelte';
  import QuickNotes from '$lib/components/QuickNotes.svelte';
  import { todayISO, nowTime } from '$lib/utils';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let loading = false;
  let saved = false;

  // Form fields
  let entry_date     = todayISO();
  let entry_time     = nowTime();
  let mood_rating:    number | null = null;
  let sleep_hours:    string = '';
  let anxiety_rating: number | null = null;
  let energy_rating:  number | null = null;
  let stress_rating:  number | null = null;
  let pain_rating:    number | null = null;
  let activity        = '';
  let medication_note = '';
  let trigger_event   = '';
  let general_note    = '';
  let tags_str        = '';

  function resetForm() {
    entry_date     = todayISO();
    entry_time     = nowTime();
    mood_rating    = null;
    sleep_hours    = '';
    anxiety_rating = null;
    energy_rating  = null;
    stress_rating  = null;
    pain_rating    = null;
    activity       = '';
    medication_note = '';
    trigger_event  = '';
    general_note   = '';
    tags_str       = '';
    saved = false;
  }

  function handleNoteSelect(e: CustomEvent<{ field: string; content: string }>) {
    const { field, content } = e.detail;
    if (field === 'general_note')    general_note    = general_note ? general_note + '\n' + content : content;
    if (field === 'trigger_event')   trigger_event   = content;
    if (field === 'activity')        activity        = content;
    if (field === 'medication_note') medication_note = content;
  }
</script>

<svelte:head>
  <title>Add Entry — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header">
    <h1 class="page-title">➕ Add Mood Entry</h1>
    <p class="page-subtitle">Log how you're feeling right now</p>
  </div>

  {#if saved}
    <div class="alert alert-success">
      ✅ Entry saved! You can add another entry below.
    </div>
  {/if}

  {#if form?.error}
    <div class="alert alert-error">{form.error}</div>
  {/if}

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result, update }) => {
        loading = false;
        if (result.type === 'success') {
          saved = true;
          resetForm();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          await update();
        }
      };
    }}
  >
    <!-- Date & Time -->
    <div class="card">
      <div class="row-2">
        <div class="form-group">
          <label class="form-label" for="entry_date">📅 Date</label>
          <input
            id="entry_date"
            name="entry_date"
            type="date"
            class="form-input"
            bind:value={entry_date}
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="entry_time">⏰ Time</label>
          <input
            id="entry_time"
            name="entry_time"
            type="time"
            class="form-input"
            bind:value={entry_time}
            required
          />
        </div>
      </div>
    </div>

    <!-- Mood -->
    <div class="card">
      <div class="form-group">
        <RatingSelector
          label="😊 Mood"
          name="mood_rating"
          bind:value={mood_rating}
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="sleep_hours">😴 Sleep Hours</label>
        <input
          id="sleep_hours"
          name="sleep_hours"
          type="number"
          class="form-input"
          min="0"
          max="24"
          step="0.5"
          placeholder="e.g. 7.5"
          bind:value={sleep_hours}
        />
      </div>
    </div>

    <!-- Other ratings -->
    <div class="card">
      <div class="form-group">
        <RatingSelector label="😰 Anxiety" name="anxiety_rating" bind:value={anxiety_rating} />
      </div>
      <div class="form-group">
        <RatingSelector label="⚡ Energy"   name="energy_rating"  bind:value={energy_rating} />
      </div>
      <div class="form-group">
        <RatingSelector label="🌡️ Stress"  name="stress_rating"  bind:value={stress_rating} />
      </div>
      <div class="form-group">
        <RatingSelector label="🩹 Pain"    name="pain_rating"    bind:value={pain_rating} />
      </div>
    </div>

    <!-- Notes section -->
    <div class="card">
      <div class="form-group">
        <label class="form-label" for="general_note">📝 General Note</label>
        <textarea
          id="general_note"
          name="general_note"
          class="form-textarea"
          placeholder="How are you feeling? What's on your mind?"
          bind:value={general_note}
          rows="3"
        ></textarea>
        <QuickNotes notes={data.notes} field="general_note" on:select={handleNoteSelect} />
      </div>

      <div class="form-group">
        <label class="form-label" for="trigger_event">⚡ Trigger / Event</label>
        <textarea
          id="trigger_event"
          name="trigger_event"
          class="form-textarea"
          placeholder="What triggered this mood? Any significant event?"
          bind:value={trigger_event}
          rows="2"
        ></textarea>
        <QuickNotes notes={data.notes} field="trigger_event" on:select={handleNoteSelect} />
      </div>

      <div class="form-group">
        <label class="form-label" for="activity">🏃 Activity</label>
        <input
          id="activity"
          name="activity"
          type="text"
          class="form-input"
          placeholder="e.g. Gym, Walk, Work, Rest…"
          bind:value={activity}
        />
        <QuickNotes notes={data.notes} field="activity" on:select={handleNoteSelect} />
      </div>

      <div class="form-group">
        <label class="form-label" for="medication_note">💊 Medication Note</label>
        <input
          id="medication_note"
          name="medication_note"
          type="text"
          class="form-input"
          placeholder="Any medication changes or notes"
          bind:value={medication_note}
        />
        <QuickNotes notes={data.notes} field="medication_note" on:select={handleNoteSelect} />
      </div>

      <div class="form-group">
        <label class="form-label" for="tags">🏷️ Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          class="form-input"
          placeholder="e.g. morning, gym, work (comma or space separated)"
          bind:value={tags_str}
        />
        <div class="form-hint">Separate tags with commas or spaces</div>
      </div>
    </div>

    <!-- Save button -->
    <button type="submit" class="btn btn-success btn-full btn-lg mt-md" disabled={loading}>
      {#if loading}
        <span class="spinner"></span> Saving…
      {:else}
        💾 Save Entry
      {/if}
    </button>
  </form>
</div>

<style>
  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: start;
  }

  .form-group { margin-bottom: 0; }
  .form-group + .form-group { margin-top: 0; }

  @media (max-width: 360px) {
    .row-2 { grid-template-columns: 1fr; }
  }
</style>
