<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import { signerAddress, chainId, chainData } from 'ethers-svelte'

  import ScanQR from '$components/ScanQR.svelte'
  import QR from '$components/QR.svelte'

  import TxAction from '$components/TxAction/index.svelte'
  import TxActionButton from '$components/TxAction/TxActionButton.svelte'
  import TxActionFeedback from '$components/TxAction/TxActionFeedback.svelte'

  import {
    decodeAnnotated,
    abiEncodeCertificate
  } from '@rougenetwork/v2-core/rouge'

  import blockchain from '$lib/blockchain.js'

  import project from '$stores/project.js'
  import cache from '$stores/nft.js'

  dayjs.extend(localizedFormat)

  // object with all data
  export let p
  export let rw = false

  let scanner
  let recording = false
  let action

  let bearer
  let tokenId
  let did
  let proof
  let certificate

  const control = {
    detected: false
  }

  $: nft = $signerAddress ? $cache[`${p._address}:${tokenId}`] || {} : {}
  $: channel = p.channels ? p.channels[nft.channelId] || {} : {}

  const onQR = async ({ detail: { data } }) => {
    control.detected = true
    console.log('onQR', data, p)

    if (/^did:rge/.test(data)) {
      throw new Error('You must use not a unlocked ticket [1]')
    }

    try {
      const decoded = await decodeAnnotated(data)

      if (decoded.contract !== p._address) {
        throw new Error('not a valid ticket [2]')
      }

      // more test like already used etc

      if (decoded.v) {
        let expire, selector, v, r, s
        // certificate case
        void ({ bearer, tokenId, expire, selector, v, r, s } = decoded)
        console.log('onQR [ certificate ]', {
          bearer,
          tokenId,
          expire,
          selector,
          v,
          r,
          s
        })

        proof = ethers.ZeroHash

        certificate = abiEncodeCertificate({
          from: bearer,
          tokenId,
          selector,
          expire,
          r,
          s,
          v
        })
      } else {
        void ({ bearer, tokenId, proof } = decoded)

        console.log('onQR [ proof ]', { bearer, tokenId, proof })

        certificate = abiEncodeCertificate()

        // TODO function in contract to check proof...
        const x = await blockchain
          .rouge($chainId)(p._address)
          .validTokenProof(tokenId, proof)
        console.log(x)

        // TODO already checkedin  getTokenInfos
      }

      did = `did:rge:${$chainData.shortName}-${p._address}-${tokenId}`
      console.log('onQR [ done ]', { did, proof, certificate })
      control.valid = true
    } catch (e) {
      console.log('fail onQR', e)
    }
  }

  const redeemCtx = async () => {
    const params = [[[tokenId, proof, certificate]]]
    return {
      call: blockchain.rouge($chainId)(p._address).redeem,
      params,
      onError: (err) => {
        console.log('tx error', err)
        //control.loadText = `Failed....`
      },
      onReceipt: () => {
        // update redeem count & co
        project.refresh(p._address)
        cache.refresh(`${p._address}:${tokenId}`)
      }
    }
  }

  const next = () => {
    control.accepted = false
    control.detected = false
    tokenId = null
    certificate = null
    proof = null
    action.reset()
    scanner.start()
  }

  onMount(() => {
    const data = localStorage.getItem('rge:dev:qrData')
    if (data) {
      onQR({ detail: { data } })
      localStorage.removeItem('rge:dev:qrData')
    }
  })
</script>

{#if p && !p._isDraft}
  {#if control.detected}
    {#if p.name && tokenId}
      <div class="card">
        <div class="card-content">
          <div class="media">
            <div class="media-left">
              <QR text={did} class="is-128x128" />
            </div>
            <div class="media-content">
              <p class="title is-4">Ticket {channel.label || ''}</p>
              <p class="subtitle is-5">tokenId #{parseInt(tokenId, 16)}</p>
              <p class="subtitle is-7">{nft?.owner || ''}</p>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="card">
        <article class="message is-danger">
          <div class="message-body">Not a valid ticket</div>
        </article>
      </div>
    {/if}
  {/if}

  <TxAction
    bind:this={action}
    let:callId
    submitCtx={redeemCtx}
    on:success={() => {
      control.accepted = true
    }}
    disabled={!rw}>
    <div class="buttons has-addons is-centered mt-4">
      {#if certificate}
        {#if control.accepted}
          <button class="button" on:click={next}>Next</button>
        {:else}
          <TxActionButton class="button is-primary"
            >Redeem onchain</TxActionButton>
          <button class="button" on:click={next}>Ignore {callId || ''}</button>
        {/if}
      {:else if recording}
        <div class="field">
          <button class="button is-info" on:click={scanner.stop}
            >Turn off camera</button>
          <p class="help">Waiting for QR code detection...</p>
        </div>
      {:else if control.detected}
        <button class="button is-warning" on:click={next}
          >Restart camera</button>
      {:else}
        <button class="button is-warning" on:click={next}
          >Turn on camera</button>
      {/if}
    </div>
    <div class="buttons is-centered mt-4">
      <TxActionFeedback />
    </div>
  </TxAction>

  <ScanQR bind:this={scanner} bind:recording on:qr={onQR} />
{/if}

<style lang="scss">
  .card {
    max-width: 500px;
    margin: auto;
  }
</style>
