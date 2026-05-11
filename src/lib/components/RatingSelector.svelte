<script lang="ts">
  import { moodColor } from '$lib/utils';
  import { createEventDispatcher } from 'svelte';

  export let value: number | null = null;
  export let name: string = 'rating';
  export let label: string = 'Rating';
  export let required = false;

  const dispatch = createEventDispatcher<{ change: number | null }>();

  function select(n: number) {
    value = value === n ? null : n;
    dispatch('change', value);
  }

  const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
</script>

<div class="rating-selector">
  <div class="rating-label">
    {label}
    {#if required}<span class="req">*</span>{/if}
    {#if value !== null}
      <span class="current-val" style="color: {moodColor(value)}">{value}/10</span>
    {/if}
  </div>
  <div class="rating-row">
    {#each ratings as n}
      <button
        type="button"
        class="rating-btn"
        class:selected={value === n}
        style={value === n ? `background: ${moodColor(n)}; border-color: ${moodColor(n)};` : ''}
        on:click={() => select(n)}
        aria-label="{label} {n}"
      >{n}</button>
    {/each}
  </div>
  <!-- Hidden input for form submission -->
  {#if value !== null}
    <input type="hidden" {name} value={value} />
  {:else if required}
    <input type="hidden" {name} value="" />
  {/if}
</div>

<style>
  .rating-selector { margin-bottom: 4px; }

  .rating-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .req { color: var(--danger); }

  .current-val {
    font-size: 0.9rem;
    font-weight: 800;
    text-transform: none;
    letter-spacing: 0;
  }

  .rating-row {
    display: flex;
    gap: 4px;
  }

  .rating-btn {
    flex: 1;
    padding: 10px 0;
    border: 2px solid var(--border);
    border-radius: 6px;
    background: var(--bg-elevated);
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.12s;
    touch-action: manipulation;
    min-width: 0;
  }

  .rating-btn:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
  }

  .rating-btn.selected {
    color: #fff;
    border-color: transparent;
    transform: scale(1.08);
  }

  @media (max-width: 400px) {
    .rating-btn { padding: 8px 0; font-size: 0.8rem; }
  }
</style>
