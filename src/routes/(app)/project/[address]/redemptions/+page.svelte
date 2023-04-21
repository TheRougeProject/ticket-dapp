<script>
  import { onMount } from 'svelte'

  import { chainId } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'

  import { formatAddress } from '$lib/utils'

  import project from '$stores/project.js'
  import nft from '$stores/nft.js'

  import { Jazzicon } from 'ethers-svelte/components'
  import EmptyState from '$components/design/EmptyState.svelte'
  import Slate from '$components/design/Slate.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  let nfts = []
  let loaded = false

  onMount(async () => {
    const contract = blockchain.rouge($chainId)(address)
    // need initial cache system counting from block X
    const events = await contract.queryFilter(contract.filters.Redeemed(), 0)
    for (const e of events) {
      console.log(e)
      nfts = [...nfts, e.args.tokenId]
    }
    loaded = true
  })
</script>

<h2 class="title">Check-in history (redemption)</h2>

{#if nfts.length === 0 && loaded}
  <EmptyState svg="/empty-box.svg">
    <h3 class="subtitle"><strong>No check-in yet!</strong></h3>
    <p class="help is-info">Use the scanner to check attendees in...</p>
  </EmptyState>
{:else}
  {#each nfts as tokenId}
    <Slate>
      <p class="subtitle">#{tokenId}</p>

      <div slot="info">
        <span class="icon-text">
          <span class="icon">
            <Jazzicon address={$nft[`${address}:${tokenId}`].owner} size={25} />
          </span>
          <span>{formatAddress($nft[`${address}:${tokenId}`].owner)}</span>
        </span>
      </div>

      <div slot="actions">
        <p>{p.channels[$nft[`${address}:${tokenId}`].channelId]?.label}</p>
      </div>
    </Slate>
  {/each}

  {#if !loaded}
    <div class="column is-4">
      <div class="box"><span class="box loader mx-auto" /></div>
    </div>
  {/if}
{/if}
