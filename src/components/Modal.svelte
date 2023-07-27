<script>
  import { onDestroy } from 'svelte'
  import { getContext, createEventDispatcher } from 'svelte'

  import { keyDownA11y } from '$lib/utils'

  import Portal from '$components/Portal.svelte'

  export let active = true
  export let noCloseButton = false
  export let topIsRounded = false
  export let bottomIsRounded = false

  let importedClasses = ''
  export { importedClasses as class }

  const dispatch = createEventDispatcher()

  export const onClose = (event) => dispatch('close', event)

  export const close = () => {
    active = false
  }

  let unsub
  const pressedKey = getContext('keys')
  if (pressedKey) {
    unsub = pressedKey.subscribe((key) => {
      if (key === 'Escape' && active) {
        onClose()
        pressedKey.set('')
      }
    })
  }

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

{#if active}
  <Portal target="body">
    <div class="modal {importedClasses}" class:is-active={active}>
      <div
        class="modal-background"
        on:click={onClose}
        on:keydown={keyDownA11y(onClose)} />
      <div
        class="modal-content"
        class:top-is-rounded={topIsRounded}
        class:bottom-is-rounded={bottomIsRounded}>
        <slot />
      </div>
      {#if !noCloseButton}
        <button
          class="modal-close is-large"
          aria-label="close"
          on:click={onClose} />
      {/if}
    </div>
  </Portal>
{/if}

<style lang="scss">
  @import '../scss/_variables.scss';
  @import 'bulma/sass/utilities/_all';

  .modal {
    &:not(.fullscreen) {
      padding-left: 2px;
      padding-right: 2px;

      .modal-content.top-is-rounded {
        border-top-left-radius: $radius-large;
        border-top-right-radius: $radius-large;
      }

      .modal-content.bottom-is-rounded {
        border-bottom-left-radius: $radius-large;
        border-bottom-right-radius: $radius-large;
      }
    }

    &.fullscreen {
      .modal-content {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: unset;
        max-height: unset;
      }
    }
  }
</style>
