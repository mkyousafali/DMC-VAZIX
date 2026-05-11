<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let loading = false;
  let digits: string[] = ['', '', '', '', '', ''];
  $: accessCode = digits.join('');

  let boxes: HTMLInputElement[] = [];

  function onDigitInput(i: number, e: Event) {
    const inp = e.target as HTMLInputElement;
    const val = inp.value.replace(/\D/g, '').slice(-1);
    inp.value = val;
    digits[i] = val;
    digits = [...digits];
    if (val && i < 5) boxes[i + 1]?.focus();
  }

  function onDigitKeydown(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      boxes[i - 1]?.focus();
    }
  }

  function onDigitPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text') ?? '';
    const nums = text.replace(/\D/g, '').slice(0, 6).split('');
    nums.forEach((d, i) => { digits[i] = d; });
    digits = [...digits];
    boxes[Math.min(nums.length, 5)]?.focus();
    e.preventDefault();
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
        <label class="form-label" for="otp_0">6-Digit Access Code</label>
        <!-- hidden input carries the joined value for form submission -->
        <input type="hidden" name="access_code" value={accessCode} />
        <div class="otp-row" on:paste={onDigitPaste}>
          {#each digits as digit, i}
            <input
              id={i === 0 ? 'otp_0' : undefined}
              bind:this={boxes[i]}
              type="password"
              inputmode="numeric"
              maxlength="1"
              class="otp-box"
              value={digit}
              autocomplete="off"
              on:input={(e) => onDigitInput(i, e)}
              on:keydown={(e) => onDigitKeydown(i, e)}
            />
          {/each}
        </div>
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

  .otp-row {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 4px;
  }

  .otp-box {
    width: 44px;
    height: 52px;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    background: rgba(255,255,255,0.85);
    border: 2px solid rgba(124,111,247,0.30);
    border-radius: 12px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    caret-color: transparent;
  }

  .otp-box:focus {
    border-color: #7c6ff7;
    box-shadow: 0 0 0 3px rgba(124,111,247,0.18);
  }

  .login-footer {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.75rem;
    margin-top: 20px;
  }
</style>
