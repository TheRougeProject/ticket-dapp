<script>
  import { onMount } from 'svelte'

  import { ethers } from 'ethers'

  import { dev } from '$app/environment'

  import {
    provider,
    signer,
    signerAddress,
    chainId,
    chainData
  } from 'svelte-ethers-store'

  import {
    generateCertificate,
    calculateStampProof,
    encodeAnnotatedProof,
    encodeAnnotatedCertificate
  } from '@rougenetwork/v2-core/rouge'

  import blockchain from '$lib/blockchain.js'
  import { keyDownA11y, formatTextMaxLength } from '$lib/utils'

  import project from '$stores/project.js'
  import cache from '$stores/nft.js'
  import secret from '$stores/secret.js'
  import registry from '$stores/registry.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import Modal from '$components/Modal.svelte'
  import QR from '$components/QR.svelte'
  import ClipboardCopy from '$components/tools/ClipboardCopy.svelte'
  import Icon from '$components/Icon.svelte'
  //import { default as qrcode } from '$icons/qrcode.svelte'
  import * as icons from '$icons/index.js'

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
        selector: blockchain.singleton($chainId).interface.getSighash('redeem'),
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
        selector: blockchain.singleton($chainId).interface.getSighash('redeem')
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
          <div class="level-item ">
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

<div class="nft box p-0 m-4" on:keydown={keyDownA11y(openQR)} on:click={openQR}>
  <img alt={p.name} data-ipfs={p.visual} use:ipfs />
  <div class="id">{nft.redeemed ? 'Stub' : 'Ticket'} #{tokenId}</div>
  <div class="qr" class:is-proven={!!proofType}>
    <svelte:component this={icons.qrcode} />
  </div>
  {#if channel.icon}
    <div class="qr">
      <img alt={channel.label} data-ipfs={channel.icon} use:ipfs />
    </div>
  {/if}
  <div class="type has-text-centered">
    <p class="cellcentered">{formatTextMaxLength(channel.label, 20)}</p>
  </div>
  <div class="state">
    {#if nft.redeemed}
      <span class="cellcentered tag is-info is-light is-medium">
        <Icon name="Checkbox" class="is-small mr-2" /> <span>used</span>
      </span>
    {:else if proofType === 0}
      <span class="cellcentered tag is-warning  is-medium">
        <Icon name="ShieldOff" class="is-small mr-2" /> <span>no proof</span>
      </span>
    {:else if proofType === 1}
      <span class="cellcentered tag is-success  is-medium">
        <Icon name="ShieldCheck" class="is-small mr-2" /> <span>proved</span>
      </span>
    {:else if proofType === 2}
      <span class="cellcentered tag is-success  is-medium">
        <Icon name="ShieldLock" class="is-small mr-2" /> <span>signed</span>
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
      color: #fff;
      text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.5);
      line-height: 100%;
      font-size: calc(
        1.8rem
      ); /* use calc() to set the font size relative to the viewport width */
      font-weight: 800;
    }

    .qr {
      grid-area: 19 / 1 / 33 / 15;
      background-color: transparent;
      padding: 0.3rem;
      line-height: 0;
    }

    .state {
      grid-area: 19 / 15 / 26 / 33;
      align-items: center;
      justify-items: center;
      position: relative;
    }

    .type {
      grid-area: 26 / 15 / 33 / 33;
      align-items: center;
      justify-items: center;
      position: relative;
      line-height: 0.8rem;
      font-size: 0.8rem;
      font-weight: 800;
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

  .media-content {
    line-height: normal;
    position: relative;

    figure {
      position: absolute;
      right: 3px;
      bottom: 0;
    }
  }
</style>
