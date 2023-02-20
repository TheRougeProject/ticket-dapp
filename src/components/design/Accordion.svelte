<script>
  import { slide } from 'svelte/transition'
  import { navigating } from '$app/stores'

  import { keyDownA11y } from '$lib/utils'

  import Icon from '$components/Icon.svelte'

  export let label
  export let opened = false
</script>

<div class="box">
  <a
    href="#open"
    class="icon-text"
    on:keydown={keyDownA11y(() => {
      opened = !opened
    })}
    on:click={() => {
      opened = !opened
    }}>
    <span class:is-rotated={opened}><Icon name="ChevronsRight" /></span>
    <span class="ml-3">{label}</span>
  </a>
</div>

{#if !$navigating && opened}
  <div transition:slide={{ duration: 200 }} class="mb-5">
    <slot />
  </div>
{/if}

<style lang="scss">
  @import '../../scss/_variables.scss';

  .box {
    padding-top: 0.6rem;
    padding-bottom: 0.4rem;
    background-color: $primary;
    color: $white;
    a:hover {
      color: $white;
    }
  }

  span {
    transition: transform 200ms;
  }

  .is-rotated {
    transform: rotate(90deg);
  }
</style>
