<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let loading = false;
  let accessCodeRaw = '';

  // Only allow digits, max 6
  function onCodeInput(e: Event) {
    const inp = e.target as HTMLInputElement;
    inp.value = inp.value.replace(/\D/g, '').slice(0, 6);
    accessCodeRaw = inp.value;
  }
</script>

<svelte:head>
  <title>Login — DMC-VAZIX</title>
</svelte:head>

<div class="login-wrapper">
  <div class="login-card">
    <!-- Logo -->
    <div class="login-logo">
      <img src="/ico-logo.jpg" alt="DMC-VAZIX" class="logo-img" />
      <h1 class="logo-title">DMC-VAZIX</h1>
      <p class="logo-sub">Daily Mood Chart Tracker</p>
    </div>

    <!-- Error alert -->
    {#if form?.error}
      <div class="alert alert-error" role="alert">{form.error}</div>
    {/if}

    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update();
        };
      }}
    >
      <div class="form-group">
        <label class="form-label" for="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          class="form-input"
          placeholder="Enter your username"
          autocomplete="username"
          autocorrect="off"
          autocapitalize="none"
          required
          value={form?.username ?? ''}
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="access_code">6-Digit Access Code</label>
        <input
          id="access_code"
          name="access_code"
          type="password"
          inputmode="numeric"
          class="form-input code-input"
          placeholder="• • • • • •"
          maxlength="6"
          autocomplete="current-password"
          required
          on:input={onCodeInput}
        />
        <div class="form-hint">6-digit numeric code only</div>
      </div>

      <button type="submit" class="btn btn-primary btn-full btn-lg" disabled={loading}>
        {#if loading}
          <span class="spinner"></span> Signing in…
        {:else}
          🔐 Sign In
        {/if}
      </button>
    </form>

    <p class="login-footer">DMC-VAZIX · Secure Mood Tracking</p>
  </div>
</div>

<style>
  .login-wrapper {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: linear-gradient(135deg, #f0eeff 0%, #e8f0ff 40%, #fce8f8 100%);
    background-attachment: fixed;
  }

  .login-card {
    width: 100%;
    max-width: 380px;
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(124,111,247,0.25);
    border-radius: var(--radius-xl);
    padding: 32px 28px;
    box-shadow: 0 12px 40px rgba(124,111,247,0.16), 0 2px 8px rgba(0,0,0,0.06);
  }

  .login-logo {
    text-align: center;
    margin-bottom: 28px;
  }

  .logo-img {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    object-fit: cover;
    margin-bottom: 12px;
    box-shadow: 0 4px 16px rgba(124,111,247,0.20);
  }

  .logo-title {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #7c6ff7, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;
  }

  .logo-sub {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .code-input {
    font-size: 1.5rem;
    letter-spacing: 0.3em;
    text-align: center;
  }

  .login-footer {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.75rem;
    margin-top: 20px;
  }
</style>
