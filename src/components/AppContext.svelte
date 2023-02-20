<script>
  import { setContext } from 'svelte'

  import { writable } from 'svelte/store'

  const pressedKey = writable('')
  setContext('keys', pressedKey)
  const handleWindowKeyDown = (key) => {
    pressedKey.set(key.code)
  }
</script>

<svelte:window on:keydown={handleWindowKeyDown} />

<slot />

<div class="version pr-1 is-size-7">
  <!-- eslint-disable -->
  <a>{__APP_NAME__} {__APP_VERSION__}</a>
  <!-- eslint-enable -->
</div>

<style lang="scss" global>
  @import '../scss/main.scss';

  body > div.app {
    position: relative;
    min-height: calc(100vh);
    xpadding-bottom: 2rem;
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
