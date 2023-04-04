<script>
  import { onMount } from 'svelte'

  import * as icons from '$icons/index.js'
  import * as tabler from '@tabler/icons-svelte'

  export let name
  export let color = 'currentColor'
  export let stroke = 2
  export let raw = false

  let importedClasses = ''
  export { importedClasses as class }

  onMount(() => {
    if (!icons[name] && !tabler[`Icon${name}`]) {
      console.warn(`*** UNSUPPORTED ICON NAME *** ${name}`)
    }
  })
</script>

{#if raw}
  {#if icons[name]}
    <svelte:component this={icons[name]} />
  {:else if tabler && tabler[`Icon${name}`]}
    <svelte:component
      this={tabler[`Icon${name}`]}
      {color}
      size="auto"
      strokeWidth={stroke} />
  {/if}
{:else}
  <span class="icon {importedClasses}">
    {#if icons[name]}
      <svelte:component this={icons[name]} />
    {:else if tabler && tabler[`Icon${name}`]}
      <svelte:component
        this={tabler[`Icon${name}`]}
        {color}
        size="auto"
        strokeWidth={stroke} />
    {/if}
  </span>
{/if}

<style lang="scss" global>
  /* for our icon */
  .icon.is-superlarge {
    height: 4rem;
    width: 4rem;
  }

  .icon.is-cover {
    width: 100%;
    height: auto;
  }
</style>
