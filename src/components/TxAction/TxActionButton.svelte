<script>
  import { getContext } from 'svelte'

  import tracker from '$stores/tracker.js'

  let importedClasses = ''
  export { importedClasses as class }

  const txAction = getContext('txAction')

  $: call = $tracker[$txAction.callId] || {}
</script>

{#if call.err || $txAction.control.err}
  <button class="button is-outlined is-info" on:click={$txAction.reset}>
    Try again?
  </button>
{:else}
  <button
    disabled={$txAction.disabled || call.step ? true : false}
    class={importedClasses}
    on:click={$txAction.submit}>
    <slot />
  </button>
{/if}
