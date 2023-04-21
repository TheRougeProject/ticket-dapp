<script>
  import { createEventDispatcher } from 'svelte'

  import { signerAddress } from 'ethers-svelte'

  import Modal from '$components/Modal.svelte'

  import backend, { authed } from '$lib/backend.js'

  let modal
  const control = {}
  const dispatch = createEventDispatcher()

  const sign = async () => {
    try {
      await backend.signIn()
      // allow callback from upstream component (modal is already null)
      dispatch('close')
    } catch (e) {
      console.log('sign error', e)
      control.error = true
    }
  }
</script>

{#if $authed}
  <slot />
{:else}
  <Modal bind:this={modal} active={!$authed} on:close noCloseButton={true}>
    <div class="modal-card is-large">
      <header class="modal-card-head has-background-light">
        <p class="modal-card-title">EIP712 signature request</p>
        <button class="delete" on:click={modal.onClose} aria-label="close" />
      </header>
      <section class="modal-card-body has-background-light">
        <p class="heading">Your wallet address is {$signerAddress}</p>

        <h3>
          Please sign an EIP712 message to accept our terms and conditions and
          let us verify your wallet address. This step is necessary to create
          search or manage a Rouge event.<br />
          <small class="size-7"
            >[ This allows us to use a fast backend gateway to store your
            metadata ]</small>
        </h3>
      </section>
      <footer class="modal-card-foot">
        <div class="field">
          <button class="button is-primary is-pulled-right" on:click={sign}
            >Sign</button>
          {#if control.error}
            <p class="help is-danger">Failed to verify your signature</p>
          {:else}
            <span class="help is-info"
              >Open wallet to start authentification and terms acceptance.</span>
          {/if}
        </div>
      </footer>
    </div>
  </Modal>
{/if}
