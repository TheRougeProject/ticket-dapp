<script>
  import { onMount } from 'svelte'

  import { signerAddress, chainData } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'

  // import Icon from '$components/Icon.svelte'

  import EmptyState from '$components/design/EmptyState.svelte'

  export let data
  $: ({ chain } = data)

  const events = [   ]

  onMount(async () => {
    blockchain.initFallback(chain)
    if ($signerAddress) blockchain.switchChain(chain)
  })

</script>

<section class="sectionx">

    <div class="level">
      <div class="level-left">
        <h2 class="title">Ticket on {$chainData.name}</h2>
      </div>
    </div>

    {#if events.length}


    {:else}
      <EmptyState svg="/no-records.svg">
        <h3 class="subtitle"><strong>No events found!</strong></h3>
        <p class="help is-info">
          Change filters
        </p>
      </EmptyState>
    {/if}

</section>
