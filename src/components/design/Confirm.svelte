<script>
  import { createEventDispatcher } from 'svelte'

  import Dialog from '$components/design/Dialog.svelte'

  export let title = ''
  export let message = ''
  export let cancelLabel = 'Cancel'
  export let confirmLabel = 'Ok'

  let dialog

  const activate = () => dialog.activate(true)

  const dispatch = createEventDispatcher()

  // stop to work regression ?
  //<slot {activate} {deactivate} />

  const confirm = () => {
    dispatch('confirm')
    dialog.activate(false)
  }
</script>

<Dialog bind:this={dialog} {title} headerCloseButton={false}>
  <slot {activate} />
  <div slot="body">{message}</div>
  <div slot="actions">
    <button class="button is-black" on:click={() => dialog.activate(false)}
      >{cancelLabel}</button>
    <button class="button is-primary" on:click={confirm}>{confirmLabel}</button>
  </div>
</Dialog>
