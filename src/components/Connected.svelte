<script>
  import { connected } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'

  import Modal from '$components/Modal.svelte'

  let modal
</script>

{#if $connected}
  <slot />
{:else}
  <Modal bind:this={modal} active={true} noCloseButton={true}>
    <div class="modal-card is-large">
      <header class="modal-card-head has-background-light">
        <p class="modal-card-title">Wallet required!</p>
      </header>
      <section class="modal-card-body">
        <h3 class="subtitle">
          Please connect your wallet before using the scanner...
        </h3>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-primary" on:click={() => blockchain.connect()}>
          Connect
        </button>
      </footer>
    </div>
  </Modal>
{/if}
