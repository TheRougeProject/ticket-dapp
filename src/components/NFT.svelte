<script>
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'

  import { ethers } from 'ethers'

  import { dev } from '$app/environment'

  import { resize } from '$lib/actions/resize.js'

  import {
    provider,
    signer,
    signerAddress,
    chainId,
    chainData
  } from 'ethers-svelte'

  import {
    generateCertificate,
    calculateStampProof,
    encodeAnnotatedProof,
    encodeAnnotatedCertificate
  } from '@rougenetwork/v2-core/rouge'

  import blockchain from '$lib/blockchain.js'
  import { keyDownA11y } from '$lib/utils'

  import project from '$stores/project.js'
  import cache from '$stores/nft.js'
  import secret from '$stores/secret.js'
  import registry from '$stores/registry.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import Modal from '$components/Modal.svelte'
  import QR from '$components/QR.svelte'
  import ClipboardCopy from '$components/tools/ClipboardCopy.svelte'
  import Icon from '$components/Icon.svelte'

  export let address
  export let tokenId
  // export let noattributes = false
  // export let noowner = false

  $: p = $project[address] || {}
  $: nft = $cache[`${address}:${tokenId}`] || {}
  $: channel = p.channels ? p.channels[nft.channelId] || {} : {}

  $: did = `did:rge:${$chainData.shortName}:${address}/${tokenId}`

  let modal
  let qrActive = false
  let isUnlocked = false
  let qrData
  let qrUnlocked // TODO proof or certificate !
  let proofType

  const ticketWidth = writable(0)
  const updater = (node) => ticketWidth.set(node.clientWidth)

  const saveLocal = async () => {
    localStorage.setItem('rge:dev:qrData', qrUnlocked)
  }

  // XXX move in lib ?
  const refreshProof = async () => {
    const { signature, expire } = registry.get(did) || {}

    // certificate are taking precedence over local proof
    if (signature) {
      qrUnlocked = encodeAnnotatedCertificate({
        contract: address,
        bearer: $signerAddress,
        tokenId,
        signature,
        selector: blockchain.singleton($chainId).interface.getFunction('redeem')
          .selector,
        expire
      })
      proofType = 2
      return
    }

    // XXX proxy doesn't work here...
    // TODO move contract instantiation inside lib...
    const rougeContract = new ethers.Contract(
      address,
      [
        'event Acquired(uint48 indexed tokenId, bytes16 stamp, uint256 salt, uint24 index)',
        'function getTokenInfos(uint48 tokenId) view returns (address owner, uint16 channelId, bytes16 stamp, bool redeemed, uint256 nextTokenId)',
        'function validTokenProof(uint16 tokenId, bytes32 proof) view returns (bool)'
      ],
      $provider
    )

    const proof = await calculateStampProof({
      // XXX check why home > wallet > open
      // answer empty half of time if  blockchain.rouge($chainId)(address),
      contract: rougeContract,
      signer: $signer,
      tokenId,
      secret: $secret
    })
    const isValid = await rougeContract.validTokenProof(tokenId, proof)

    if (isValid) {
      //console.log('ticket has valid local prood...', { isValid })
      qrUnlocked = encodeAnnotatedProof({
        contract: address,
        bearer: $signerAddress,
        tokenId,
        proof
      })
      proofType = 1
      return
    }

    proofType = 0
  }

  const openQR = async () => {
    qrData = did
    // TODO move in cache for faster QR popup...
    await refreshProof()
    qrActive = true
  }

  const certify = async () => {
    try {
      const { signature, expire } = await generateCertificate({
        signer: $signer,
        contract: address,
        tokenId,
        selector: blockchain.singleton($chainId).interface.getFunction('redeem')
          .selector
      })
      registry.set(did, { signature, expire })
      refreshProof()
    } catch (err) {
      console.log('certify err ', err)
    }
  }

  onMount(refreshProof)

  let src
</script>

<Modal bind:this={modal} bind:active={qrActive} noCloseButton={true}>
  <div class="modal-card">
    <header class="has-background-light p-5">
      <div class="level is-mobile is-align-items-start">
        <div class="level-left">
          {#if channel.icon}
            <div class="level-item pr-3">
              <figure class="image is-48x48">
                <img alt={channel.label} data-ipfs={channel.icon} use:ipfs />
              </figure>
            </div>
          {/if}
          <div class="level-item">
            <div class="">
              <p>{p.name}</p>
              <p class="is-size-7 mt-2">{channel.label}</p>
              <p class="heading mt-2">
                NFT {nft.redeemed ? 'Ticket Stub' : 'Ticket'} tokenId #{tokenId}
              </p>
              <!-- todo link explorer -->
            </div>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <button
              class="delete"
              aria-label="close"
              on:click={() => {
                modal.close()
                isUnlocked = false
              }} />
          </div>
        </div>
      </div>
    </header>
    <section
      class="modal-card-body"
      style="position: relative; min-height: 432px;">
      {#if !nft.redeemed}
        <p class="has-text-centered field">
          {#if !qrUnlocked}
            <button class="button is-primary mr-3" on:click={certify}
              >Sign a ticket proof</button>
          {:else}
            <input
              id="unlock"
              type="checkbox"
              class="switch"
              disabled={qrUnlocked ? undefined : true}
              bind:checked={isUnlocked} />
            <label for="unlock"
              >{isUnlocked
                ? 'Lock ticket QR to keep your proof safe'
                : 'Unlock ticket QR to enable check-in proof scan'}</label>
          {/if}
        </p>
      {/if}
      {#if isUnlocked}
        <article class="message is-warning">
          <div class="message-body">
            This is your unlocked ticket QR that you can use for check-in proof
            scan. Don't share it with untrusted parties!
          </div>
        </article>
        <QR color="#900" text={qrUnlocked} bind:src />
      {:else}
        {#if nft.redeemed}
          <article class="message is-info">
            <div class="message-body">
              Ticket Stub : this NFT has alredy been used but you can still
              share the ticket identifier.
            </div>
          </article>
        {:else}
          <article class="message is-info">
            <div class="message-body">
              This QR code is a NFT ticket identifier that you can share safely
              without any risk.
              {#if qrUnlocked}
                You can unlock this ticket to display the ticket proof that is
                used for check-in.
              {:else}
                This NFT ticket was created on another device or browser, so you
                must sign a certificate for this ticket (this operation is gas
                free) to build a valid proof usable during the check-in process.
              {/if}
            </div>
          </article>
        {/if}
        <QR text={did} />
      {/if}
      <p class="has-text-centered is-size-7">
        <small><span>{did}</span></small>
      </p>
    </section>
    {#if isUnlocked}
      <footer class="modal-card-foot">
        <a
          class="button is-info"
          href={src}
          download={`${p.name}#${tokenId}.png`}>Download</a>
        <ClipboardCopy let:copy text={qrUnlocked} tootipLabel="QR code copied!">
          <button class="button" on:click={copy}>Copy as text</button>
        </ClipboardCopy>
        <!-- -
           <button class="button" on:click={() => saveLocal(qrData)}>Send by email</button>
           <button class="button" on:click={modal.close}>Share</button>
      -->
        {#if dev}
          <button class="button" on:click={() => saveLocal(qrData)}
            >devpush {proofType}</button>
        {/if}
      </footer>
    {/if}
  </div>
</Modal>

<div
  use:resize={updater}
  class="nft box p-0 m-4"
  on:keydown={keyDownA11y(openQR)}
  on:click={openQR}>
  <img alt={p.name} data-ipfs={p.visual} use:ipfs />
  <div
    class="id"
    style="height: {Math.floor(
      (4 / 32) * $ticketWidth
    )}px; font-size: {Math.floor(
      (4 / 32) * $ticketWidth
    )}px; line-height: {Math.floor((4 / 32) * $ticketWidth)}px">
    <span>{nft.redeemed ? 'Stub' : 'Ticket'} #{tokenId}<span /></span>
  </div>
  {#if channel.icon}
    <div class="qr">
      <img alt={channel.label} data-ipfs={channel.icon} use:ipfs />
    </div>
  {:else}
    <div class="qr" class:is-proven={!!proofType}>
      <Icon name="Ticket" class="is-block" />
    </div>
  {/if}
  <div
    class="type has-text-centered"
    style="font-size: {Math.floor(
      (3 / 32) * $ticketWidth
    )}px; line-height: {Math.floor((3 / 32) * $ticketWidth)}px">
    <p class="cellcentered">{channel.label}</p>
  </div>
  <div
    class="state"
    style="height: {Math.floor(
      (4 / 32) * $ticketWidth
    )}px; font-size: {Math.floor(
      (2.5 / 32) * $ticketWidth
    )}px; line-height: {Math.floor((3 / 32) * $ticketWidth)}px">
    {#if nft.redeemed}
      <span class="tag is-info">
        <span class="memo"><Icon name="Checkbox" raw={true} /></span>
        <span>used</span>
      </span>
    {:else if proofType === 0}
      <span class="tag is-warning">
        <span class="memo"><Icon name="ShieldOff" raw={true} /></span>
        <span>no proof</span>
      </span>
    {:else if proofType === 1}
      <span class="tag is-success">
        <span class="memo"><Icon name="ShieldCheck" raw={true} /></span>
        <span>proved</span>
      </span>
    {:else if proofType === 2}
      <span class="tag is-success">
        <span class="memo"><Icon name="ShieldLock" raw={true} /></span>
        <span>signed</span>
      </span>
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../scss/_variables.scss';

  /*
  Grid    = 32 x 32
  visual  = 32 x 18  [ 768 * 432 16:9 ]
  Ticket# = 32 x 4
  QR/icon = 14 * 14   with 6 % padding
  2 blocs = 18 x 7
  */

  .nft {
    display: grid;
    background-color: $grey-lightest;
    grid-template-columns: repeat(32, 1fr);
    grid-template-rows: repeat(32, 1fr);
    column-gap: 0;
    row-gap: 0;
    box-shadow: 12px 12px 8px rgb(0 0 0 / 0.2);
    cursor: pointer;
    font-size: 100%;

    &:hover {
      background-color: $grey-lighter;
      cursor: pointer;
      transform: scale(1.02);
    }

    img {
      grid-area: 1 / 1 / 19 / 33; /* <row-start> / <column-start> / <row-end> / <column-end> */
      width: 100%;
      height: auto;
      object-fit: cover;
      user-drag: none;
      -webkit-user-drag: none;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }

    .id {
      grid-area: 2 / 2 / 6 / 32;
      background-color: transparent;
      span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #fff;
        text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.5);
        font-weight: 800;
      }
    }

    .state {
      grid-area: 14 / 2 / 18 / 32;
      position: relative;
      .tag {
        position: absolute;
        font-size: inherit;
        line-height: inherit;
        height: 100%;
        right: 0;
        bottom: 0;
        border-radius: 0.3em;
      }
      .memo {
        height: 80%;
        width: 80%;
        padding-right: 0.35em;
      }
    }

    .qr {
      grid-area: 19 / 1 / 33 / 15;
      background-color: transparent;
      padding: 0.3rem;
      line-height: 0;
      color: #ccc;
    }

    .type {
      grid-area: 19 / 15 / 33 / 33;
      align-items: center;
      justify-items: center;
      position: relative;
      font-weight: 800;
      padding: 0.3rem;
      p {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .cellcentered {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .modal-card header {
    color: hsl(0deg, 0%, 21%);
    font-size: 1.25rem;
    line-height: 1;
  }
</style>
