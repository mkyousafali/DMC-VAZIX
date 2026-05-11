<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import type { AppUser } from '$lib/types';

  export let data: PageData;
  export let form: ActionData;

  let showCreate = false;
  let saving = false;

  // Reset code modal
  let resetTarget: AppUser | null = null;
  let newCode = '';

  function openReset(user: AppUser) { resetTarget = user; newCode = ''; }
  function closeReset() { resetTarget = null; }
</script>

<svelte:head>
  <title>User Management — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header flex justify-between items-center">
    <div>
      <h1 class="page-title">👥 Users</h1>
      <p class="page-subtitle">{data.users.length} accounts</p>
    </div>
    <div class="flex gap-sm">
      <a href="/admin" class="btn btn-ghost btn-sm">← Admin</a>
      <button class="btn btn-primary btn-sm" on:click={() => (showCreate = !showCreate)}>
        {showCreate ? '✕' : '➕ New User'}
      </button>
    </div>
  </div>

  {#if form?.error}  <div class="alert alert-error">{form.error}</div>  {/if}
  {#if form?.success} <div class="alert alert-success">✅ Done!</div> {/if}

  <!-- Create user form -->
  {#if showCreate}
    <div class="card mb-md">
      <h3 class="font-semibold mb-md">Create New User</h3>
      <form method="POST" action="?/create" use:enhance={() => {
        saving = true;
        return async ({ update }) => { saving = false; showCreate = false; await update(); };
      }}>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input id="username" name="username" type="text" class="form-input" required placeholder="username" />
          </div>
          <div class="form-group">
            <label class="form-label" for="access_code">6-Digit Code</label>
            <input id="access_code" name="access_code" type="text" inputmode="numeric" class="form-input" required maxlength="6" pattern="\d{6}" placeholder="000000" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="display_name">Display Name</label>
            <input id="display_name" name="display_name" type="text" class="form-input" placeholder="Full name (optional)" />
          </div>
          <div class="form-group">
            <label class="form-label" for="role">Role</label>
            <select id="role" name="role" class="form-select">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" disabled={saving}>
          {saving ? 'Creating…' : '✅ Create User'}
        </button>
      </form>
    </div>
  {/if}

  <!-- Users table -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last Login</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.users as user}
          <tr>
            <td>
              <div class="user-cell">
                <span class="font-bold">{user.display_name ?? user.username}</span>
                {#if user.display_name}
                  <span class="text-xs text-muted">@{user.username}</span>
                {/if}
              </div>
            </td>
            <td>
              <span class="badge {user.role === 'master_admin' ? 'badge-master' : user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
                {user.role.replace('_',' ')}
              </span>
            </td>
            <td>
              <span class="badge {user.is_active ? 'badge-active' : 'badge-inactive'}">
                {user.is_active ? 'Active' : 'Disabled'}
              </span>
            </td>
            <td class="text-xs text-muted">
              {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
            </td>
            <td>
              <div class="action-btns">
                <!-- Toggle active (not for master_admin) -->
                {#if user.role !== 'master_admin'}
                  <form method="POST" action="?/toggleActive">
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="is_active" value={!user.is_active} />
                    <button type="submit" class="btn btn-ghost btn-sm">
                      {user.is_active ? '🚫 Disable' : '✅ Enable'}
                    </button>
                  </form>
                {/if}

                <button class="btn btn-ghost btn-sm" on:click={() => openReset(user)}>🔑 Reset</button>

                <a href="/export?user_id={user.id}" class="btn btn-ghost btn-sm">📄 Export</a>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<!-- Reset code modal -->
{#if resetTarget}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={closeReset}></div>
  <div class="modal">
    <h3 class="font-bold mb-md">🔑 Reset Access Code</h3>
    <p class="text-muted text-sm mb-md">User: <strong>{resetTarget.username}</strong></p>
    <form method="POST" action="?/resetCode" use:enhance={() => {
      return async ({ update }) => { closeReset(); await update(); };
    }}>
      <input type="hidden" name="id" value={resetTarget.id} />
      <div class="form-group">
        <label class="form-label" for="new_code">New 6-Digit Code</label>
        <input
          id="new_code"
          name="new_code"
          type="text"
          inputmode="numeric"
          class="form-input"
          maxlength="6"
          pattern="\d{6}"
          required
          bind:value={newCode}
          placeholder="000000"
        />
      </div>
      <div class="flex gap-sm mt-md">
        <button type="submit" class="btn btn-primary flex-1">✅ Reset Code</button>
        <button type="button" class="btn btn-ghost" on:click={closeReset}>Cancel</button>
      </div>
    </form>
  </div>
{/if}

<style>
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
  .form-group { margin-bottom: 0; }
  .user-cell { display: flex; flex-direction: column; }
  .action-btns { display: flex; gap: 4px; flex-wrap: wrap; }
  form { display: contents; }

  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300;
  }

  .modal {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 301;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 28px;
    width: min(90vw, 360px);
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 600px) {
    .form-row { grid-template-columns: 1fr; }
    .action-btns { flex-direction: column; }
  }
</style>
