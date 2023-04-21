<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import blockchain from '$lib/blockchain.js'

  import { provider, signerAddress } from 'ethers-svelte'

  import TxButton from '$components/TxAction/Button.svelte'

  export let contract
  export let amount
  export let max = false
  export let allowed = false
  export let sufficient = false

  let state = 'loading...'
  let balance = 0n
  let allowance = 0n

  $: number = max ? ethers.MaxUint256 : amount.number

  const load = async () => {
    if (amount.token._isNative) {
      allowed = true
      const balance = await $provider.getBalance($signerAddress)
      sufficient = balance >= amount.number
      state = null

      return
    }

    balance = await blockchain
      .erc20(amount.token.address)
      .balanceOf($signerAddress)
    allowance = await blockchain
      .erc20(amount.token.address)
      .allowance($signerAddress, contract)

    sufficient = balance >= amount.number
    allowed = allowance >= amount.number
    state = null
  }

  const approveCtx = async () => {
    return {
      call: blockchain.erc20(amount.token.address).approve,
      params: [contract, number]
      // on error load() also ?
    }
  }

  onMount(load)
</script>

{#if !sufficient}
  <TxButton disabled={true} class="button">
    Not enough {amount.token.symbol}
  </TxButton>
{:else if !allowed}
  <TxButton
    disabled={state == null ? undefined : true}
    class="button"
    submitCtx={approveCtx}
    on:success={load}>
    Approve <slot />
  </TxButton>
{/if}
