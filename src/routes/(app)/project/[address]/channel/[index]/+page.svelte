<script>
  import { onMount } from 'svelte'

  import { chainId, chainData } from 'ethers-svelte'

  import { goto } from '$app/navigation'

  import { getChainTokens } from '$lib/blockchain.js'

  import project from '$stores/project.js'

  import Channel from '$components/form/Channel.svelte'

  export let data

  $: ({ address, index } = data)

  let hasErrors = false

  $: p = $project[address] || {}
  $: tokens = $chainId ? getChainTokens($chainId, $chainData) : {}

  let form
  let input

  const save = async () => {
    if (!(await form.validate())) {
      hasErrors = true
      return
    }
    hasErrors = false

    const { symbol, price, free, ...channel } = input

    if (!free) {
      channel.amount = tokens[symbol].newAmount(Number(price)).toJSON()
    }
    const updated = [...p.channels]
    updated[index] = channel

    project.updateDraft(address, { ...p, channels: updated })
    project.refresh(address)

    goto(`/project/${address}/draft`)
    //history.go(-1)
  }

  onMount(() => {
    const channel = $project[address].channels[index]
    if (channel.amount) {
      input = {
        ...channel,
        price: channel.amount.toFloat(),
        symbol: channel.amount.token.symbol
      }
    } else {
      input = {
        ...channel,
        free: true
      }
    }
  })
</script>

{#if p._isDraft}
  {#if index != null}
    <h2 class="title">Update ticket sales channel</h2>
  {:else}
    <h2 class="title">Add a ticket sales channel</h2>
  {/if}

  {#if input}<Channel bind:this={form} bind:data={input} />{/if}

  <div class="level slate is-mobile">
    <div class="level-left">
      {#if hasErrors}<p class="help is-danger pr-3">
          Please fix errors above
        </p>{/if}
    </div>
    <div class="level-right">
      <div class="level-item">
        <button class="button is-black" on:click={() => history.go(-1)}
          >Cancel</button>
      </div>
      <div class="level-item">
        <button class="button is-primary" on:click={save}>Save</button>
      </div>
    </div>
  </div>
{:else}
  <article class="message is-warning">
    <div class="message-body">
      You cannot yet add new channel in this beta version.
    </div>
  </article>
{/if}
