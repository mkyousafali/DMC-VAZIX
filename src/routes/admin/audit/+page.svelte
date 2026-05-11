<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  $: totalPages = Math.ceil(data.total / data.limit);
</script>

<svelte:head>
  <title>Audit Log — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header flex justify-between items-center">
    <div>
      <h1 class="page-title">📋 Audit Log</h1>
      <p class="page-subtitle">{data.total} events total</p>
    </div>
    <a href="/admin" class="btn btn-ghost btn-sm">← Admin</a>
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Action</th>
          <th>Actor</th>
          <th>Details</th>
          <th>IP</th>
        </tr>
      </thead>
      <tbody>
        {#if data.logs.length === 0}
          <tr>
            <td colspan="5" style="text-align:center; color: var(--text-muted);">No audit records found.</td>
          </tr>
        {:else}
          {#each data.logs as log}
            <tr>
              <td class="text-xs text-muted" style="white-space:nowrap">
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td>
                <span class="action-badge" class:login={log.action.includes('login')} class:admin-action={log.action.includes('created') || log.action.includes('reset') || log.action.includes('disabled')}>
                  {log.action.replace(/_/g, ' ')}
                </span>
              </td>
              <td class="text-sm">{log.actor_username ?? '—'}</td>
              <td class="text-xs text-muted">
                {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
              </td>
              <td class="text-xs text-muted">{log.ip_address ?? '—'}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="pagination">
      {#if data.page > 1}
        <a href="/admin/audit?page={data.page - 1}" class="btn btn-ghost btn-sm">← Prev</a>
      {/if}
      <span class="text-muted text-sm">Page {data.page} of {totalPages}</span>
      {#if data.page < totalPages}
        <a href="/admin/audit?page={data.page + 1}" class="btn btn-ghost btn-sm">Next →</a>
      {/if}
    </div>
  {/if}
</div>

<style>
  .action-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    background: var(--bg-elevated);
    color: var(--text-secondary);
    text-transform: capitalize;
    white-space: nowrap;
  }

  .action-badge.login { background: rgba(34,197,94,0.15); color: #86efac; }
  .action-badge.admin-action { background: rgba(245,158,11,0.15); color: #fde68a; }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
  }
</style>
