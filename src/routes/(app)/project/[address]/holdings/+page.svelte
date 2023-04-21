<script>
  import { ethers } from 'ethers'

  import { signerAddress, chainId } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'

  import project from '$stores/project.js'

  import Slate from '$components/design/Slate.svelte'
  import Address from '$components/design/Address.svelte'
  import TxButton from '$components/TxAction/Button.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  const withdrawCtx = (token) => {
    if (token === ethers.ZeroAddress) {
      return {
        call: blockchain.rouge($chainId)(address).widthdraw,
        params: [$signerAddress, p.balances[token].number],
        onReceipt: () => {
          project.refresh(address)
        }
      }
    }
    return {
      call: blockchain.rouge($chainId)(address).widthdrawToken,
      params: [token, $signerAddress, p.balances[token].number],
      onReceipt: () => {
        project.refresh(address)
      }
    }
  }
</script>

<h2 class="title">Holdings</h2>

{#if Object.keys(p.balances || {}).length === 0}
  <EmptyState svg="/empty-box.svg">
    <h3 class="subtitle"><strong>No holdings.</strong></h3>
    <p class="help is-info" />
  </EmptyState>
{:else}
  {#each Object.keys(p.balances || {}) as token}
    <Slate>
      <p>
        {p.balances[token].token.symbol}
        {#if token === ethers.ZeroAddress}
          <Address noIdenticon={true} {address}>native coin</Address>
        {:else}
          <Address noIdenticon={true} address={token} />
        {/if}
      </p>

      <div slot="info">
        <p>{p.balances[token]}</p>
      </div>
      <div slot="actions">
        <TxButton
          class="button is-outlined is-primary"
          disabled={p.balances[token].number === 0n}
          submitCtx={() => withdrawCtx(token)}>
          Withdraw All
        </TxButton>
      </div>
    </Slate>
  {/each}
{/if}
