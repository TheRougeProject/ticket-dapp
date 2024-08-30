<script>
  import { browser } from '$app/environment'
  import theme from '../../lib/theme.store'

  export let isTrue = false

  $: if (browser) {
    document.body.dataset.theme = $theme
    localStorage.setItem('theme', $theme)
  }
</script>

<button
  type="button"
  aria-label="Toggle Dark/Light Mode"
  on:click={() =>
    theme.update((value) => (value === 'light' ? 'dark' : 'light'))}
  class="button is-responsive"
>
  {#if $theme === 'dark'}
    <iconify-icon class="" width="20" icon="tdesign:mode-dark"></iconify-icon>
  {:else if $theme === 'light'}
    <iconify-icon width="20" icon="ic:twotone-light-mode"></iconify-icon>
  {/if}
</button>
