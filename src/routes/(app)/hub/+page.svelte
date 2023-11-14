<script>

  import {
    getChainDataByChainId,
  } from 'ethers-svelte'

  import {
    ethereum,
    // metisBlack,
    // arbitrum,
    arbitrumNova,
    optimism
} from '$icons/strings.js'

  import { getSupportedChainIds } from '$lib/enums.js'

  import registry from '$stores/registry.js'

  $: supportedChainIds = getSupportedChainIds($registry.includeTestnets)

  const graphics = {
    1: { icon: ethereum },
    10: { icon: optimism },
    42170: {  icon: arbitrumNova }
  }

</script>

<section class="sectionx">

  <div class="level">
    <div class="level-left">
      <h2 class="title">Choose the chain</h2>
    </div>
  </div>

  <span class="field ml-2 hidden">
    <input
      id="testnets"
      type="checkbox"
      name="testnets"
      class="switch is-rtl"
      bind:checked={$registry.includeTestnets} />
    <label class="has-text-grey-light" for="testnets"
    >Include testnets?</label>
  </span>



  <section id="why" class="hero is-medium xis-info">
    <div class="hero-body has-text-centered has-big-titles">
      <div class="columns is-multiline mt-4">

        {#each supportedChainIds as id}
          <div class="column is-half">
            <a
              href="/hub/{getChainDataByChainId(id)?.shortName}">
              <div class="box">
                <p class="title">{getChainDataByChainId(id)?.name}</p>

                <div class="m-auto" style="height: 5em; width: 5em;">
                  {#if graphics[id]}
                    {@html graphics[id].icon}
                  {/if}
                </div>

              </div>
            </a>
          </div>
        {/each}

      </div>
    </div>
  </section>


</section>
