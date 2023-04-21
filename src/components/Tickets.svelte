<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import { signerAddress, chainId, chainData } from 'ethers-svelte'

  import NFT from '$components/NFT.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'

  import blockchain from '$lib/blockchain.js'

  import nft from '$stores/nft.js'

  export let address
  export let bearer
  export let loading = true

  $: nfts = $nft.keys
    ? $nft.keys.filter(
        (key) => key.split(':')[0] === address && $nft[key].owner === bearer
      )
    : []

  export const load = async () => {
    loading = true
    if (!bearer) {
      bearer = $signerAddress
    } else {
      bearer = ethers.getAddress(bearer)
    }
    const project = blockchain.rouge($chainId)(address)
    // auto discovery potential NFT
    const events = await project.queryFilter(
      project.filters.Transfer(null, bearer),
      0
    )
    for (const e of events) {
      const owner = await project.ownerOf(e.args.tokenId)
      if (owner === bearer) {
        nft.add(`${address}:${e.args.tokenId}`)
      }
    }
    // can be too fast so add some buffer
    setTimeout(() => {
      loading = false
    }, 500)
  }

  onMount(load)
</script>

{#if nfts.length === 0 && !loading}
  <div class="columns is-mobile is-centered">
    <div class="column is-half">
      <EmptyState svg="/no-records.svg">
        <h3 class="subtitle"><strong>No ticket found!</strong></h3>
      </EmptyState>
    </div>
  </div>
{:else}
  <div class="columns is-multiline">
    {#each nfts.map((key) => key.split(':')) as [address, tokenId]}
      <div class="column is-4">
        <NFT {address} {tokenId} noowner={true} />
      </div>
    {/each}
    {#if loading}
      <div class="column is-4">
        <div class="box"><span class="box loader mx-auto" /></div>
      </div>
    {:else}
      <div
        class="column is-4 is-flex is-align-items-center is-justify-content-center">
        <a
          href="/i/ticket/{$chainData.shortName}:{address}/"
          class="button is-small is-primary is-outlined">Get more tickets</a>
      </div>
    {/if}
  </div>
{/if}
