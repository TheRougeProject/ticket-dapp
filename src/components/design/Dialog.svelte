<script>
  import Modal from '$components/Modal.svelte'

  export let title = ''
  export let headerCloseButton = true

  // only internal state
  let active = false

  export const activate = (value = !active) => {
    active = value
  }

  let modal
</script>

{#if active}
  <Modal
    bind:this={modal}
    bind:active
    noCloseButton={true}
    on:close={() => activate(false)}>
    <div class="modal-card">
      <header class="modal-card-head ">
        <p class="modal-card-title">{title}</p>
        {#if headerCloseButton}
          <button class="delete" aria-label="close" on:click={modal.onClose} />
        {/if}
      </header>
      <section class="modal-card-body has-background-white-ter">
        <slot name="body" />
      </section>
      <footer class="modal-card-foot">
        <slot name="actions" />
      </footer>
    </div>
  </Modal>
{:else}
  <slot />
{/if}

<style lang="scss">
  @import '../../scss/_variables.scss';

  .modal-card {
    max-width: 400px;
  }
</style>
