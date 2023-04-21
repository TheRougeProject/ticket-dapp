<script>
  import { createEventDispatcher } from 'svelte'

  import { chainId, chainData } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'

  import Modal from '$components/Modal.svelte'
  import ScanQR from '$components/ScanQR.svelte'

  export let active = false
  export let title = 'Load an existing event'
  export let actionLabel = 'Load'

  const dispatch = createEventDispatcher()

  let input
  let modal

  const control = { scan: false }

  const candidate = async (address) => {
    try {
      const { uri, channels, balances } = await blockchain
        .rouge($chainId)(address)
        .getInfos()
      console.log('ONCHAIN data', { uri, channels, balances })
      dispatch('success', address)
      modal.close()
      input = null
    } catch (e) {
      console.log('can load that address', e)
      return false
    }
    return true
  }

  const action = async () => {
    const matchLink = input.match(/\/i\/ticket\/\d+-(0x[A-Fa-f0-9]{40})\b/)
    if (matchLink) {
      console.log('detecting link', matchLink[1])
      if (await candidate(matchLink[1])) return
    }
    const matchId = input.match(/\/i\/ticket\/[\w-]+:(0x[A-Fa-f0-9]{40})\b/)
    if (matchId) {
      console.log('detecting id', matchId[0], matchId[1])
      if (await candidate(matchId[1])) return
    }
    const matchAddress = input.match(/\b(0x[A-Fa-f0-9]{40})\b/)
    if (matchAddress) {
      console.log('detecting address', matchAddress[1])
      // TODO check if ticket type ...
      if (await candidate(matchAddress[1])) return
    }
    control.error = true
  }

  const onQR = async ({ detail: { data } }) => {
    input = data
  }

  let scanner
  const startScanner = async () => {
    control.scan = true
    scanner.start()
  }
  const stopScanner = async () => {
    scanner.stop()
    control.scan = false
  }

  const cancel = async () => {
    stopScanner()
    modal.close()
    input = null
    control.error = false
  }
</script>

<Modal bind:this={modal} bind:active noCloseButton={true} topIsRounded={true}>
  <div class="modal-card is-large">
    <section class="modal-card-body has-background-light">
      <h2 class="title">{title}</h2>

      <ScanQR bind:this={scanner} on:qr={onQR} visible={control.scan} />

      <div class="columns is-multiline mt-4">
        <div class="column is-full">
          <div class="field">
            <label for="event" class="label"
              >Enter event id, event link, contract address or ticket code</label>
            <p class="control">
              <input
                id="event"
                class="input"
                class:is-danger={control.error}
                type="text"
                bind:value={input}
                placeholder="Event id, event link, contract address or ticket code" />
            </p>
            {#if control.error}<p class="help is-danger">
                This input doesn't match any event on {$chainData.name}
              </p>{/if}
          </div>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      {#if control.scan}
        <button class="button is-primary is-outlined" on:click={stopScanner}
          >Stop scanner</button>
      {:else}
        <button class="button is-primary is-outlined" on:click={startScanner}>
          Scan <span class="is-hidden-mobile">event/ticket QR code</span>
        </button>
      {/if}
      <button class="button is-black" on:click={cancel}>Cancel</button>
      <button
        disabled={input ? undefined : true}
        class="button is-primary"
        on:click={action}>{actionLabel}</button>
    </footer>
  </div>
</Modal>
