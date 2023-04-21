<script>
  import { onMount, onDestroy } from 'svelte'

  import {
    getChainDataByChainId,
    signerAddress,
    chainId,
    chainData
  } from 'ethers-svelte'

  import NFT from '$components/NFT.svelte'
  import Project from '$components/Project.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'

  import blockchain from '$lib/blockchain.js'

  import project from '$stores/project.js'
  import nft from '$stores/nft.js'

  export let data

  $: ({ chain, contract } = data)

  $: p = $project[contract] || {}

  $: validChain = $chainId === chain

  $: nfts = $nft.keys
    ? $nft.keys.filter(
        (key) =>
          key.split(':')[0] === contract && $nft[key].owner === $signerAddress
      )
    : []

  let loaded

  const unsub = signerAddress.subscribe(async ($signerAddress) => {
    if (!$signerAddress) return

    // can't use validchain here (not yet updated)
    if ($chainId !== chain) return

    const project = blockchain.rouge($chainId)(contract)
    // auto discovery potential NFT
    const events = await project.queryFilter(
      project.filters.Transfer(null, $signerAddress),
      0
    )
    for (const e of events) {
      const owner = await project.ownerOf(e.args.tokenId)
      if (owner === $signerAddress) {
        nft.add(`${contract}:${e.args.tokenId}`)
      }
    }
    loaded = true
  })

  let chainName
  onMount(() => {
    loaded = false
    chainName = getChainDataByChainId(chain).name

    // TODO error if unsupported chain

    blockchain.initFallback(chain)
    if (!$signerAddress) blockchain.autoConnect(chain)

    // TODO when chainId incorrect
  })

  onDestroy(unsub)
</script>

<Project {p}>
  <h3 class="title">My tickets</h3>

  {#if !$signerAddress || !validChain}
    <EmptyState svg="/bad-connection.svg">
      {#if !validChain}
        <h3 class="subtitle">
          <strong>Not connected to {chainName || `chainId ${chain}`}</strong>
        </h3>
      {:else}
        <h3 class="subtitle"><strong>Not connected!</strong></h3>
      {/if}
      <button
        class="button is-primary"
        on:click={() => blockchain.connect(chain)}>Connect Wallet</button>
      <p class="help is-info">
        Connect your wallet to {chainName || `chainId ${chain}`} to check your tickets
        for this event
      </p>
    </EmptyState>
  {:else if nfts.length === 0 && loaded}
    <div class="columns is-mobile is-centered">
      <div class="column is-half">
        <EmptyState svg="/no-records.svg">
          <h3 class="subtitle"><strong>No ticket found!</strong></h3>
          <a
            class="button is-primary"
            href="/i/ticket/{$chainData.shortName}-{contract}/"
            >Go buy tickets!</a>
        </EmptyState>
      </div>
    </div>
  {:else}
    <div class="columns is-multiline">
      {#each nfts.map((key) => key.split(':')) as [tokenId]}
        <div class="column is-4">
          <NFT {contract} {tokenId} noowner={true} />
        </div>
      {/each}
      {#if !loaded}
        <div class="column is-4">
          <div class="box"><span class="box loader mx-auto" /></div>
        </div>
      {/if}
    </div>

    {#if loaded}
      <a
        class="button is-primary"
        href="/i/ticket/{$chainData.shortName}-{contract}/"
        >Buy more tickets...</a>
    {/if}
  {/if}
</Project>
