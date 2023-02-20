<script>
  import Modal from '$components/Modal.svelte'

  export let active = true
</script>

<Modal bind:active noCloseButton={true}>
  <div class="p-6">
    <div class="m-6 notification">
      <slot />
    </div>
  </div>
</Modal>
