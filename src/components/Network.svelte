<script>
  import {
    signerAddress,
    chainId,
    chainData,
    getChainDataByChainId
  } from 'ethers-svelte'

  import { Jazzicon } from 'ethers-svelte/components'

  import { supportedChainIds } from '$lib/enums.js'

  import Modal from '$components/Modal.svelte'

  import blockchain from '$lib/blockchain.js'

  export let active

  let modal
</script>

<Modal
  bind:this={modal}
  bind:active
  noCloseButton={true}
  topIsRounded={true}
  on:close={() => modal.close()}>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Connection status</p>
      <button class="delete" aria-label="close" on:click={modal.close} />
    </header>
    <section class="modal-card-body">
      <span class="icon-text">
        <span>Connected with account</span>
        <span class="icon"
          ><Jazzicon address={$signerAddress} size={24} /></span>
        <small>{$signerAddress}&nbsp;</small>
        <span
          >on network <span class="tag is-primary">{$chainData.name}</span
          ></span>
      </span>

      <hr />
      <p class="has-text-centered is-size-7 mb-3">
        Looking for another supported networks? Switch to or add automatically a
        network (may not work for all wallet)...
      </p>

      <p class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly">
        {#each supportedChainIds.filter((i) => i !== $chainId) as id}
          <button
            on:click={() => modal.close() && blockchain.switchChain(id)}
            class="button is-small is-primary is-outlined"
            >Switch to network {getChainDataByChainId(id).name}</button>
        {/each}
        {#each supportedChainIds.filter((i) => i !== $chainId) as id}
          <button
            on:click={() => modal.close() && blockchain.addChain(id)}
            class="button is-small is-primary is-outlined"
            >Add network {getChainDataByChainId(id).name}</button>
        {/each}
      </p>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-black" on:click={modal.close}>Cancel</button>
      <button
        class="button is-primary"
        on:click={() => {
          blockchain.disconnect()
          modal.close()
        }}>Disconnect</button>
    </footer>
  </div>
</Modal>
