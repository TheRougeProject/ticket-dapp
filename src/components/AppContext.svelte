<script>
  import { setContext } from 'svelte'

  import { writable, derived } from 'svelte/store'

  const pressedKey = writable('')

  setContext('keys', pressedKey)

  const handleWindowKeyDown = (key) => {
    pressedKey.set(key.code)
  }

  const innerWidth = writable(0)
  export const mobile = derived(innerWidth, ($innerWidth) => $innerWidth < 769)
  setContext('mobile', mobile)
</script>

<svelte:window on:keydown={handleWindowKeyDown} bind:innerWidth={$innerWidth} />

<slot />

<div class="version pr-1 is-size-7">
  <!-- eslint-disable -->
  <a>{__APP_NAME__} {__APP_VERSION__}</a>
  <!-- eslint-enable -->
</div>

<style lang="scss" global>
  @import '../scss/main.scss';

  body {
    position: relative;
    height: fit-content;
  }

  .version {
    position: absolute;
    bottom: 2px;
    left: 4px;
    a {
      color: #ddd;
    }
  }
</style>
