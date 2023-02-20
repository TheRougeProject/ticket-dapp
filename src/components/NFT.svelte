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

  import Rouge from '@rougenetwork/v2-core/Rouge.json'

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

  export let address
  export let tokenId
  export let noattributes = false
  export let noowner = false

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
    const rougeContract = new ethers.Contract(address, Rouge.abi, $provider)

    const proof = await calculateStampProof({
      // XXX check why home > wallet > open
      // answer empty half of time if  blockchain.rouge(address),
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

<div class="card mb-2">
  {#if !noowner}
    <footer class="card-header">
      <p class="card-footer-item is-size-7">
        owner: {(nft?.owner || '').slice(0, 20)}...
      </p>
    </footer>
  {/if}

  <div class="card-content p-0">
    <div class="media" on:keydown={keyDownA11y(openQR)} on:click={openQR}>
      <div class="media-left" style="width: 50%;">
        <figure class="image is-16:9">
          {#if $project[address].visual}
            <img alt={p.name} data-ipfs={p.visual} use:ipfs />
          {:else}
            <img alt="no visual" src="/empty_p.png" />
          {/if}
        </figure>
      </div>
      <div class="media-content is-size-7">
        <p class="icon-text">
          <span>{nft.redeemed ? 'Stub' : 'Ticket'} #{tokenId}</span>
          <Icon
            name="qrcode"
            class="pt-1 ml-2 is-small {proofType ? 'is-proven' : ''}" />
        </p>
        <p class="is-size-7">{formatTextMaxLength(channel.label, 20)}</p>

        {#if nft.redeemed}
          <span class="mt-1 tag is-info is-light">
            <Icon name="Checkbox" class="is-small" /> <span>used</span>
          </span>
        {:else if proofType === 0}
          <span class="mt-1 tag is-warning">
            <Icon name="ShieldOff" class="is-small" /> <span>no proof</span>
          </span>
        {:else if proofType === 1}
          <span class="mt-1 tag is-success">
            <Icon name="ShieldCheck" class="is-small" /> <span>proved</span>
          </span>
        {:else if proofType === 2}
          <span class="mt-1 tag is-success">
            <Icon name="ShieldLock" class="is-small" /> <span>signed</span>
          </span>
        {/if}
        {#if channel.icon}
          <figure class="image is-24x24">
            <img alt={channel.label} data-ipfs={channel.icon} use:ipfs />
          </figure>
        {/if}
      </div>
    </div>
  </div>

  {#if !noowner}
    <footer class="card-footer">
      <p class="card-footer-item is-size-7">
        {(nft?.description || '').slice(0, 200)}...
      </p>
    </footer>
  {/if}

  {#if !noattributes && nft?.attributes}
    <footer class="card-footer">
      <p class="has-text-centered">
        {#each nft.attributes as attribut}
          <span class="tag m-1">
            {attribut.trait_type} = {attribut.value}
          </span>
        {/each}
      </p>
    </footer>
  {/if}
</div>

<style lang="scss">
  @import '../scss/_variables.scss';

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

  .card-content:hover {
    background-color: $grey-lightest;
    cursor: pointer;
  }
</style>
