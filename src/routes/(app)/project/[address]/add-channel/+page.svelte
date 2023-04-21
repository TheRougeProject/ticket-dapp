<script>
  import { chainId, chainData } from 'ethers-svelte'

  import { goto } from '$app/navigation'

  import { getChainTokens } from '$lib/blockchain.js'

  import Channel from '$components/form/Channel.svelte'

  import project from '$stores/project.js'

  export let data

  $: ({ address } = data)

  let hasErrors = false

  let form

  let input = {
    type: 'ticket',
    free: false
  }

  $: p = $project[address] || {}
  $: tokens = $chainId ? getChainTokens($chainId, $chainData) : {}

  const add = async () => {
    if (!p._isDraft) return

    if (!(await form.validate())) {
      hasErrors = true
      return
    }
    hasErrors = false

    const { symbol, price, free, ...channel } = input

    if (!free) {
      channel.amount = tokens[symbol].newAmount(Number(price)).toJSON()
    }

    project.updateDraft(address, { ...p, channels: [...p.channels, channel] })
    project.refresh(address)

    goto(`/project/${address}/draft`)
  }
</script>

<h2 class="title">Add a ticket sales channel</h2>

{#if p._isDraft}
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
        <button class="button is-primary" on:click={add}>Add</button>
      </div>
    </div>
  </div>
{:else}
  <article class="message is-warning">
    <div class="message-body">
      You cannot add new channel after publishing in this beta version.
    </div>
  </article>
{/if}
