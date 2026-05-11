<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let displayName = data.user.display_name ?? '';
  let saving = false;
</script>

<svelte:head>
  <title>Settings — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header">
    <h1 class="page-title">⚙️ Settings</h1>
    <p class="page-subtitle">Account & preferences</p>
  </div>

  {#if form?.error}
    <div class="alert alert-error">{form.error}</div>
  {/if}
  {#if form?.success}
    <div class="alert alert-success">✅ Settings updated.</div>
  {/if}

  <div class="card mb-md">
    <h2 class="font-semibold mb-md">👤 Profile</h2>
    <div class="profile-info">
      <div class="info-row">
        <span class="text-muted">Username</span>
        <span class="font-bold">{data.user.username}</span>
      </div>
      <div class="info-row">
        <span class="text-muted">Role</span>
        <span class="badge {data.user.role === 'master_admin' ? 'badge-master' : data.user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
          {data.user.role.replace('_', ' ')}
        </span>
      </div>
    </div>
  </div>

  <div class="card mb-md">
    <h2 class="font-semibold mb-md">✏️ Display Name</h2>
    <form method="POST" action="?/updateDisplayName" use:enhance={() => {
      saving = true;
      return async ({ update }) => { saving = false; await update(); };
    }}>
      <div class="form-group">
        <label class="form-label" for="display_name">Display Name</label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          class="form-input"
          placeholder="Your full name (optional)"
          bind:value={displayName}
        />
        <div class="form-hint">This name appears in your PDF reports.</div>
      </div>
      <button type="submit" class="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : '💾 Save'}
      </button>
    </form>
  </div>

  <div class="card mb-md">
    <h2 class="font-semibold mb-md">ℹ️ App Info</h2>
    <div class="info-row"><span class="text-muted">App</span><span>DMC-VAZIX v1.0.0</span></div>
    <div class="info-row"><span class="text-muted">Purpose</span><span>Daily Mood Chart Tracking</span></div>
    <div class="info-row"><span class="text-muted">Auth</span><span>Custom (no Supabase Auth)</span></div>
  </div>

  <div class="card">
    <h2 class="font-semibold mb-md text-danger">⚠️ Security Notes</h2>
    <ul class="security-list">
      <li>Access codes are hashed with bcrypt in the database.</li>
      <li>Session tokens expire after 7 days.</li>
      <li>All data is user-scoped — other users cannot see your entries.</li>
      <li>Contact your admin to reset your access code.</li>
    </ul>
  </div>
</div>

<style>
  .profile-info { display: flex; flex-direction: column; gap: 10px; }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
  }

  .info-row:last-child { border-bottom: none; }

  .form-group { margin-bottom: 12px; }

  .security-list {
    list-style: disc;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
</style>
