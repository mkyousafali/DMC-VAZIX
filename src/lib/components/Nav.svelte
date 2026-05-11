<script lang="ts">
  import { page } from '$app/stores';
  import type { SessionUser } from '$lib/types';

  export let user: SessionUser | null = null;

  const navItems = [
    { href: '/dashboard',  icon: '🏠', label: 'Home'    },
    { href: '/entry',      icon: '➕', label: 'Add'     },
    { href: '/today',      icon: '📋', label: 'Today'   },
    { href: '/history',    icon: '📅', label: 'History' },
    { href: '/export',     icon: '📄', label: 'Export'  }
  ];

  $: currentPath = $page.url.pathname;
  $: isAdmin = user?.role === 'master_admin' || user?.role === 'admin';

  let menuOpen = false;
  function toggleMenu() { menuOpen = !menuOpen; }
  function closeMenu() { menuOpen = false; }
</script>

<!-- Top bar -->
<header class="top-bar">
  <a href="/dashboard" class="brand">
    <span class="brand-icon">📊</span>
    <span class="brand-name">DMC-VAZIX</span>
  </a>

  <div class="top-actions">
    {#if user}
      <button class="menu-btn" on:click={toggleMenu} aria-label="Menu">
        <span class="avatar">{user.display_name?.[0]?.toUpperCase() ?? user.username[0].toUpperCase()}</span>
      </button>
    {/if}
  </div>
</header>

<!-- Dropdown menu -->
{#if menuOpen && user}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="menu-overlay" on:click={closeMenu}></div>
  <div class="dropdown-menu">
    <div class="menu-user">
      <div class="menu-username">{user.display_name ?? user.username}</div>
      <div class="menu-role text-xs text-muted">{user.role.replace('_', ' ')}</div>
    </div>
    <div class="divider"></div>
    <a href="/notes"    class="menu-item" on:click={closeMenu}>📝 Saved Notes</a>
    <a href="/settings" class="menu-item" on:click={closeMenu}>⚙️ Settings</a>
    {#if isAdmin}
      <a href="/admin"        class="menu-item" on:click={closeMenu}>🛡️ Admin Panel</a>
      <a href="/admin/users"  class="menu-item" on:click={closeMenu}>👥 Users</a>
      <a href="/admin/audit"  class="menu-item" on:click={closeMenu}>📋 Audit Log</a>
    {/if}
    <div class="divider"></div>
    <form method="POST" action="/api/auth/logout">
      <button type="submit" class="menu-item menu-logout">🚪 Logout</button>
    </form>
  </div>
{/if}

<!-- Bottom navigation -->
{#if user}
  <nav class="bottom-nav">
    {#each navItems as item}
      <a
        href={item.href}
        class="nav-item"
        class:active={currentPath === item.href || currentPath.startsWith(item.href + '/')}
      >
        <span class="nav-icon">{item.icon}</span>
        <span class="nav-label">{item.label}</span>
      </a>
    {/each}
  </nav>
{/if}

<style>
  /* ── Top bar ─────────────────────────────────────────────────────────── */
  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 56px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }

  .brand-icon { font-size: 1.4rem; }

  .brand-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--accent-light);
    letter-spacing: -0.02em;
  }

  .top-actions { display: flex; gap: 8px; align-items: center; }

  .menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    border-radius: 50%;
    text-transform: uppercase;
  }

  /* ── Dropdown menu ───────────────────────────────────────────────────── */
  .menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 199;
  }

  .dropdown-menu {
    position: fixed;
    top: 64px;
    right: 12px;
    z-index: 200;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    min-width: 200px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    animation: fadeIn 0.12s ease;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } }

  .menu-user {
    padding: 12px 16px;
  }

  .menu-username {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .menu-role {
    margin-top: 2px;
    text-transform: capitalize;
  }

  .menu-item {
    display: block;
    width: 100%;
    padding: 10px 16px;
    text-decoration: none;
    color: var(--text-primary);
    font-size: 0.9rem;
    transition: background 0.1s;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-family: var(--font-body);
  }

  .menu-item:hover { background: var(--bg-elevated); }

  .menu-logout { color: var(--danger); }

  /* ── Bottom nav ──────────────────────────────────────────────────────── */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 64px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: stretch;
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    text-decoration: none;
    color: var(--text-muted);
    transition: color 0.15s;
    padding: 6px 0;
  }

  .nav-item.active { color: var(--accent-light); }
  .nav-item:hover  { color: var(--text-secondary); }
  .nav-item.active:hover { color: var(--accent-light); }

  .nav-icon  { font-size: 1.3rem; line-height: 1; }
  .nav-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

  form { display: contents; }
</style>
