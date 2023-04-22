<script>
  import { onMount, onDestroy } from 'svelte'
  import { writable } from 'svelte/store'

  import { ethers } from 'ethers'
  import {
    getChainDataByChainId,
    chainId,
    provider,
    signerAddress,
    signer
  } from 'ethers-svelte'

  import { abiEncodeAcquire } from '@rougenetwork/v2-core/rouge'
  import { TokenAmountSet } from 'erc-token-js'

  import blockchain from '$lib/blockchain.js'
  import { ipfs } from '$lib/actions/ipfs.js'
  import { keyDownA11y } from '$lib/utils'

  import account from '$stores/account.js'
  import project from '$stores/project.js'
  import secret from '$stores/secret.js'
  import nft from '$stores/nft.js'

  import Icon from '$components/Icon.svelte'
  import Approve from '$components/ApproveERC20.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'
  import TxButton from '$components/TxAction/Button.svelte'
  import Project from '$components/Project.svelte'
  import Modal from '$components/Modal.svelte'

  export let data
  $: ({ chain, contract } = data)

  $: p = $project[contract] || {}

  $: validChain = $chainId === chain

  // TODO need also to check chain ...
  $: isOur =
    ($signerAddress &&
      $project.addresses &&
      $project.addresses.includes(contract)) ||
    false

  // XXX reroute if type not correct ? or remove type from param ?

  // 1 = choosing, 2 connecting, 3 checkout, 4 submitted
  let step = 1
  let success = false

  const cart = writable({})
  const allowed = writable({})
  const sufficient = writable({})

  $: readyAllow = !Object.values($allowed).includes(false)
  $: readyBalance = !Object.values($sufficient).includes(false)

  const unsub = cart.subscribe((selection) => {
    const tokenSet = TokenAmountSet.from([])
    let totalQty = 0
    for (const i of Object.keys(selection)) {
      if (/^\d+$/.test(i)) {
        if (p.channels[i].amount && selection[i]) {
          tokenSet.add(p.channels[i].amount.mul(BigInt(selection[i])))
        }
        totalQty += selection[i]
      }
    }

    selection.total = tokenSet.toString(' + ')
    selection.tokenSet = tokenSet
    selection.totalQty = totalQty
  })

  onMount(async () => {
    blockchain.initFallback(chain)
    if (!$signerAddress) blockchain.autoConnect(chain)
  })

  const validate = async () => {
    if (!$signerAddress) return
    const { chainId } = await $provider.getNetwork()

    if (chainId !== chain) {
      step = step < 2 ? step : 2
      return
    }
    step = step === 2 ? 3 : step
  }
  const unsub2 = signerAddress.subscribe(validate)

  onDestroy(() => {
    unsub()
    unsub2()
  })

  const bookmark = async () => {
    if (!$signerAddress) await blockchain.connect(chain)
    // TODO loop until connection & chain ok
    project.addBearer(contract)
  }

  $: balances = $signerAddress ? $account.balancesFor(contract) : {}

  const buyCtx = async () => {
    if (!readyAllow || !readyBalance) return

    success = false

    const acquisitions = []
    Object.keys($cart).forEach((channelId) => {
      if (!/^\d+$/.test(channelId)) return
      // last test over max
      if (
        p.channels[channelId].max &&
        $cart[channelId] >
          p.channels[channelId].max - (balances[channelId] || 0)
      ) {
        $cart[channelId] =
          p.channels[channelId].max - (balances[channelId] || 0)
        step = 1
        return
      }
      acquisitions.push({ channelId, qty: $cart[channelId] })
    })
    console.log({ channels: p.channels, acquisitions })
    const params = await abiEncodeAcquire({
      channels: p.channels,
      contract: blockchain.rouge($chainId)(contract),
      signer: $signer,
      secret: $secret,
      acquisitions
    })

    step = 4

    return {
      call: blockchain.rouge($chainId)(contract).acquire,
      params,
      onError: () => {
        step = 3
      },
      onReceipt: async (rcpt) => {
        project.addBearer(contract)
        const instance = blockchain.rouge($chainId)(contract)
        const events = await instance.queryFilter(
          instance.filters.Transfer(ethers.ZeroAddress, $signerAddress),
          rcpt.blockNumber
        )
        for (const e of events) {
          if (e.transactionHash !== rcpt.hash) continue
          nft.add(`${contract}:${e.args.tokenId}`)
        }
      }
    }
  }

  // had robots in head?
  //     name="robots"      content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"

  // https://stackoverflow.com/questions/43095312/ogevent-eventstart-time-not-working

  let modal
</script>

<svelte:head>
  <title>{p.name}</title>
  <meta name="description" content={p.name} />
  <meta property="og:title" content={p.name} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content={p.name} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta property="twitter:title" content={p.name} />
</svelte:head>

<Modal bind:this={modal} active={success} on:close noCloseButton={true}>
  <div class="modal-card">
    <section class="modal-card-body has-background-light has-text-centered">
      <Icon name="Confetti" color="#900" class="is-superlarge" />

      <h3 class="my-4 title">Well done!</h3>

      <p class="my-4 subtitle">Your NFT ticket(s) have been issued!</p>

      <p class="my-4">
        <a class="my-4 is-primary" href="/book"
          >See them in the tickets book or as NFT in your wallet...</a>
      </p>

      <a class="button is-primary text-icon my-4" href="/book">
        <Icon name="Book" /> <span class="pl-2 pr-0">Tickets book</span>
      </a>

      {#if /0xaFbe5Ea6b281ddCbb72273953293fE4A852Dbc00/i.test(contract)}
        <a class="button is-primary text-icon my-4" href="/i/special/foxwallet">
          <Icon name="Book" /> <span class="pl-2 pr-0">Back to Bingo Game</span>
        </a>
      {/if}
    </section>
  </div>
</Modal>

<div class="container is-max-desktop pt-6">
  <div class="container is-fluid pt-5">
    <nav class="level is-mobile mb-2">
      <div class="level-left">
        {#if !p._isDraft}
          <div class="level-item">
            {#if /0xaFbe5Ea6b281ddCbb72273953293fE4A852Dbc00/i.test(contract)}
              <a
                class="button is-text is-small is-responsive"
                href="/i/special/foxwallet">
                <span>Back to Bingo Game</span>
              </a>
            {:else if balances.total}
              <a class="button is-text is-small is-responsive" href="/book">
                <Icon name="Book" class="mr-1" />{balances.total} ticket{balances.total >
                1
                  ? 's'
                  : ''} already collected
              </a>
            {:else if $project.addressesAsBearer && $project.addressesAsBearer.includes(contract)}
              <a class="button is-text is-small is-responsive" href="/book">
                <Icon name="Bookmark" class="mr-1" />This event is bookmarked
              </a>
            {:else if p._loaded}
              <button
                class="button is-text is-small is-responsive"
                on:click={bookmark}>
                <Icon name="Bookmark" class="mr-1" />Bookmark this event
              </button>
            {/if}
          </div>
        {/if}
      </div>
      {#if isOur}
        <div class="level-right">
          <div class="level-item">
            <a
              class="button is-text is-small is-responsive"
              href="/project/{contract}/{$project[contract]._isDraft
                ? 'draft/'
                : ''}">
              <Icon name="Tools" class="mr-1" />Manager view
            </a>
          </div>
        </div>
      {/if}
    </nav>

    <div class="box">
      {#if p._isDraft}
        <article class="message is-primary">
          <div class="message-body">
            Preview of your "get tickets" page.<br />
            Publish it on chain & share it to start the ticket distribution.
          </div>
        </article>
      {/if}

      <Project {p}>
        <h3 class="title">Get tickets</h3>

        <div class="tabs is-centered xis-boxed is-fullwidth">
          <ul>
            <li
              on:keydown={keyDownA11y(() => {
                step = 1
              })}
              on:click={() => {
                step = 1
              }}
              class:is-active={step === 1}>
              <a href="#select">
                <Icon name="select" />
                <span>1. Select</span>
              </a>
            </li>
            <li class:is-active={step === 2 || (step > 2 && !validChain)}>
              <a href="#connect">
                <Icon name="connect" />
                <span>2. Connect</span>
              </a>
            </li>
            <li class:is-active={step >= 3 && validChain}>
              <a href="#checkout">
                <Icon name="checkout" />
                <span>3. Checkout</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- ##################################################################  -->
        {#if p && step === 1}
          {#if !p.channels}
            <EmptyState svg="/empty-box.svg">
              <h3 class="subtitle"><strong>No tickets available</strong></h3>
              <p class="help is-info">
                Sorry, no tickets are available for this event...
              </p>
            </EmptyState>
          {:else if p.state && !p.state.enabled.acquire}
            <EmptyState svg="/empty-box.svg">
              <h3 class="subtitle"><strong>No tickets available</strong></h3>
              <p class="help is-info">
                Sorry, sales is closed for this event...
              </p>
            </EmptyState>
          {:else}
            <table class="table is-striped is-fullwidth is-hoverable">
              <thead class="classic">
                <tr>
                  <th colspan="5">Description</th>
                  <th colspan="2" class="has-text-right">Price</th>
                  <th colspan="1" class="has-text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {#each p.channels || [] as channel, i}
                  <tr style="vertical-align: center;">
                    {#if channel.icon}
                      <th colspan="1">
                        <figure class="image is-48x48">
                          <img
                            alt="channel icon"
                            data-ipfs={channel.icon}
                            use:ipfs />
                        </figure>
                      </th>
                    {/if}
                    <th
                      colspan={channel.icon ? 4 : 5}
                      style="vertical-align: center;">{channel.label}</th>
                    <td colspan="2" class="has-text-right">
                      {channel?.amount?.toString() || 'Free'}
                    </td>
                    <td colspan="1" class="has-text-right">
                      <input
                        class="input is-narrow"
                        type="number"
                        min="0"
                        max={channel.max - (balances[i] || 0) || undefined}
                        disabled={channel.max &&
                        (balances[i] || 0) >= channel.max
                          ? true
                          : undefined}
                        bind:value={$cart[i]} />
                      {#if channel.max && balances[i] >= channel.max}
                        <p class="help is-info">
                          maximum {channel.max} reached
                        </p>
                      {:else if channel.max}
                        <p class="help is-info">
                          maximum = {channel.max}{#if balances[i]}, collected = {balances[
                              i
                            ] || 0}{/if}
                        </p>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
              <thead>
                <tr>
                  <th colspan="5" />
                  <th colspan="3" class="has-text-right"
                    >Total = {$cart.total || 'tx gas only'}</th>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th class="mt-3 has-text-right" colspan="8">
                    <button
                      class="button is-primary"
                      disabled={$cart.totalQty < 1 ? true : undefined}
                      on:click={() => {
                        if ($cart.totalQty < 1) return
                        step = 2
                        validate()
                      }}>Next</button>
                  </th>
                </tr>
              </tfoot>
            </table>
          {/if}
        {/if}

        <!-- ##################################################################  -->
        {#if step === 2 || (step > 2 && !validChain)}
          <EmptyState svg="/bad-connection.svg">
            {#if !validChain}
              <h3 class="subtitle">
                <strong
                  >Not connected to {getChainDataByChainId(chain).name}</strong>
              </h3>
            {:else}
              <h3 class="subtitle"><strong>Not yet connected!</strong></h3>
            {/if}
            <button
              class="button is-primary"
              on:click={() => blockchain.connect(chain)}>Connect Wallet</button>
            <p class="help is-info">
              Connect your wallet to {getChainDataByChainId(chain).name} to complete
              your order.
            </p>
          </EmptyState>
        {/if}

        <!-- ##################################################################  -->
        {#if step >= 3 && validChain}
          <h3 class="heading has-text-centered mb-3">Order summary</h3>

          {#each Object.keys($cart) as entry}
            {#if /^\d+$/.test(entry) && $cart[entry]}
              <div class="box level slate">
                <div class="level-left">
                  {#if p.channels[entry].icon}
                    <div class="level-item">
                      <figure class="image is-48x48">
                        <img
                          alt="channel icon"
                          data-ipfs={p.channels[entry].icon}
                          use:ipfs />
                      </figure>
                    </div>
                  {/if}
                  <div class="level-item">
                    <p class="subtitle">
                      <span class="icon-text">
                        <span>{$cart[entry]} x {p.channels[entry].label}</span>
                      </span>
                    </p>
                  </div>
                </div>
                <div class="level-right">
                  <p class="level-item">
                    {p.channels[entry]?.amount?.toString() || 'free'}
                  </p>
                </div>
              </div>
            {/if}
          {/each}

          <div class="box m-6 has-text-right">
            {#if !readyBalance}
              <article class="message is-danger">
                <div class="message-body">
                  You don't have enough funds to buy these tickets
                </div>
              </article>
            {:else if !readyAllow}
              <article class="message is-danger">
                <div class="message-body">
                  In order to buy your ticket(s), you must first approve token
                  spending.
                </div>
              </article>
            {/if}

            {#each $cart.tokenSet.values() as amount}
              <Approve
                {contract}
                {amount}
                max={false}
                bind:allowed={$allowed[amount.token.address]}
                bind:sufficient={$sufficient[amount.token.address]}>
                {amount.toString()}
              </Approve>
            {/each}

            {#if !success && !p._isDraft}
              {#key readyBalance}
                {#key readyAllow}
                  <TxButton
                    disabled={!readyAllow || !readyBalance}
                    class="button is-primary mt-4"
                    submitCtx={buyCtx}
                    on:success={() => (success = true)}>
                    Checkout {#if $cart.total}({$cart.total}){/if}
                  </TxButton>
                  {#if readyBalance && readyAllow}
                    <p>
                      After payment, each purchased ticket will be delivered as
                      an NFT.
                    </p>
                  {/if}
                {/key}
              {/key}
            {/if}

            <!--
                 <p>I trust this device, store proof of ownership on this device for quick redemption</p>
            -->
          </div>
        {/if}
      </Project>
    </div>
  </div>
</div>

<style lang="scss">
  .icon.is-superlarge {
    height: 4rem;
    width: 4rem;
  }

  @import '../../../../../scss/_variables.scss';
  @import 'bulma/sass/utilities/_all';

  input.is-narrow {
    max-width: 7rem;
    width: auto;
    diplay: in-line;
  }

  .tabs li.is-active a {
    border-bottom-width: 2px;
    border-bottom-color: $brand;
    color: $brand;
  }

  tbody th,
  tbody td {
    vertical-align: middle;
  }

  @include mobile {
    .tabs > ul {
      flex-direction: column;

      li {
        width: 100%;
      }

      li.is-active a {
        border-bottom-color: $brand;
        color: $brand;
      }
    }

    table,
    thead,
    tbody,
    th,
    td,
    tr {
      display: block;
    }

    thead.classic tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }

    tbody tr {
      border: 1px solid #ccc;
    }

    td {
      /* Behave  like a "row" */
      border: none;
      border-bottom: 1px solid #eee;
      position: relative;
      padding-left: 30%;
    }

    td:before {
      /* Now like a table header */
      position: absolute;
      /* Top/left values mimic padding */
      top: 6px;
      left: 6px;
      width: 45%;
      padding-right: 10px;
      white-space: nowrap;
    }

    td:nth-of-type(1):before {
      content: 'Price';
    }
    td:nth-of-type(2):before {
      content: 'Qty';
    }
  }
</style>
