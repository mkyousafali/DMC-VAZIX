<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  export let params: Record<string, string> = {};
</script>

<Nav user={data.user} />

<main style="padding-top: 56px;">
  <slot />
</main>
