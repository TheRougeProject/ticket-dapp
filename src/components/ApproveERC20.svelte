<script>
  import { onMount } from 'svelte'
  import { constants, utils, BigNumber } from 'ethers'

  import blockchain from '$lib/blockchain.js'

  import { signerAddress } from 'svelte-ethers-store'

  import TxButton from '$components/TxAction/Button.svelte'

  export let contract
  export let amount
  export let max = false
  export let allowed = false
  export let insufficient = false

  let state = 'loading...'
  let balance = BigNumber.from(0)
  let allowance = BigNumber.from(0)

  $: number = max ? constants.MaxUint256 : amount.number

  const load = async () => {
    balance = await blockchain
      .erc20(amount.token.address)
      .balanceOf($signerAddress)
    allowance = await blockchain
      .erc20(amount.token.address)
      .allowance($signerAddress, contract)
    console.log(
      '[%s] balance = %s / allowance = %s ',
      amount.token.symbol,
      utils.formatUnits(balance + '', amount.token.decimals),
      utils.formatUnits(allowance + '', amount.token.decimals)
    )
    if (allowance.gte(amount.number)) {
      amount.addTag('allowed')
      allowed = true
    }
    if (balance.lt(amount.number)) {
      insufficient = true
    }
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

{#if !allowed}
  <TxButton
    disabled={state ? undefined : true}
    class="button"
    submitCtx={approveCtx}
    on:success={load}>
    Approve {amount + ''}
  </TxButton>
{/if}
