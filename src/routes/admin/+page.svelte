<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Admin Panel — DMC-VAZIX</title>
</svelte:head>

<div class="page-wrapper">
  <div class="page-header">
    <h1 class="page-title">🛡️ Admin Panel</h1>
    <p class="page-subtitle">System overview</p>
  </div>

  <!-- Stats -->
  <div class="stats-grid mb-md">
    <div class="stat-card">
      <div class="stat-value" style="color: var(--accent-light)">{data.stats.totalUsers}</div>
      <div class="stat-label">Total Users</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: var(--success)">{data.stats.totalEntries}</div>
      <div class="stat-label">Total Entries</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: var(--warning)">{data.stats.todayEntries}</div>
      <div class="stat-label">Today's Entries</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: var(--text-secondary)">🔐</div>
      <div class="stat-label">{data.user?.role?.replace('_',' ')}</div>
    </div>
  </div>

  <!-- Quick links -->
  <div class="admin-links mb-md">
    <a href="/admin/users" class="admin-link-card">
      <span class="link-icon">👥</span>
      <span class="link-text">Manage Users</span>
      <span class="link-arrow">→</span>
    </a>
    <a href="/admin/audit" class="admin-link-card">
      <span class="link-icon">📋</span>
      <span class="link-text">Audit Log</span>
      <span class="link-arrow">→</span>
    </a>
    <a href="/export" class="admin-link-card">
      <span class="link-icon">📄</span>
      <span class="link-text">Export Reports</span>
      <span class="link-arrow">→</span>
    </a>
    <a href="/history" class="admin-link-card">
      <span class="link-icon">📅</span>
      <span class="link-text">View All Entries</span>
      <span class="link-arrow">→</span>
    </a>
  </div>

  <!-- Recent audit -->
  <div class="card">
    <div class="flex justify-between items-center mb-md">
      <h2 class="font-semibold">⏱️ Recent Activity</h2>
      <a href="/admin/audit" class="text-sm text-accent">View all →</a>
    </div>
    {#if data.recentAudit.length === 0}
      <p class="text-muted text-sm">No recent activity.</p>
    {:else}
      <div class="audit-list">
        {#each data.recentAudit as log}
          <div class="audit-row">
            <span class="audit-action">{log.action.replace(/_/g, ' ')}</span>
            <span class="audit-user text-muted text-xs">{log.actor_username ?? '—'}</span>
            <span class="audit-time text-xs text-muted">{new Date(log.created_at).toLocaleString()}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .admin-links { display: flex; flex-direction: column; gap: 8px; }

  .admin-link-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--text-primary);
    transition: all 0.15s;
  }

  .admin-link-card:hover {
    border-color: var(--accent);
    background: rgba(99,102,241,0.06);
  }

  .link-icon { font-size: 1.3rem; }
  .link-text { flex: 1; font-weight: 600; }
  .link-arrow { color: var(--text-muted); }

  .audit-list { display: flex; flex-direction: column; gap: 0; }

  .audit-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.85rem;
  }

  .audit-row:last-child { border-bottom: none; }

  .audit-action { flex: 1; text-transform: capitalize; }
  .audit-user { min-width: 80px; }
  .audit-time { white-space: nowrap; }
</style>
