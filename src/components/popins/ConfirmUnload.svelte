<script>
  import Confirm from '$components/design/Confirm.svelte'

  export let p = {}
</script>

<Confirm
  let:activate
  title="Unload from event manager?"
  message="Are you sure you want to unload the event «{p.name}» from the manager & forget it on this device? (you can always load it back later, it's on the blockchain!)"
  confirmLabel="Unload & Forget"
  on:confirm>
  <slot {activate} />
</Confirm>
