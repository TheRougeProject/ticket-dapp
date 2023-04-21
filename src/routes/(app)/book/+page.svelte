<script>
  import { signerAddress, chainData } from 'ethers-svelte'

  import dayjs from 'dayjs'

  import blockchain from '$lib/blockchain.js'
  import { ipfs } from '$lib/actions/ipfs.js'
  import { keyDownA11y } from '$lib/utils.js'

  import project from '$stores/project.js'
  import chainContext from '$stores/chain.js'

  import Icon from '$components/Icon.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'
  import Tickets from '$components/Tickets.svelte'
  import LoadEvent from '$components/form/LoadEvent.svelte'
  import Confirm from '$components/design/Confirm.svelte'

  $: addressesAsBearer = $project.addressesAsBearer || []

  const loaders = {}
  const tickets = {}

  let loadActive = false

  const success = ({ detail }) => {
    project.addBearer(detail)
  }
</script>

<section class="sectionx">
  {#if !$signerAddress}
    <EmptyState svg="/bad-connection.svg">
      <h3 class="subtitle"><strong>Not connected!</strong></h3>
      <button class="button is-primary" on:click={() => blockchain.connect()}
        >Connect Wallet</button>
      <p class="help is-info">Connect your wallet to to see your tickets</p>
    </EmptyState>
  {:else}
    <LoadEvent
      bind:active={loadActive}
      actionLabel="Add"
      title="Search event and add missing tickets in your book"
      on:success={success} />

    <div class="level">
      <div class="level-left">
        <h2 class="title">Your tickets book on {$chainData.name}</h2>
      </div>
      {#if $chainContext.hasPlugin('search')}
        <div class="level-right">
          <div class="level-item">
            <div class="level-item">
              <a class="button is-primary is-inverted" href="/book/search"
                >Missing tickets?</a>
            </div>
          </div>
        </div>
      {/if}
    </div>

    {#if addressesAsBearer && addressesAsBearer.length}
      {#each addressesAsBearer as address}
        <hr />

        <div class="box level is-slate">
          <div class="level-left">
            <div class="level-item">
              <a
                href="/project/{address}/{$project[address]._isDraft
                  ? 'draft/'
                  : ''}">
                {#key addressesAsBearer.length}
                  <figure class="image xis-16by9" style="width: 150px;">
                    {#if $project[address].visual}
                      <img
                        data-ipfs={$project[address].visual}
                        src="/empty_p.png"
                        alt="Project main visual"
                        style="object-fit: cover;"
                        use:ipfs />
                    {:else}
                      <img
                        src="/empty_p.png"
                        alt="Project main visual"
                        style="object-fit: cover;" />
                    {/if}
                  </figure>
                {/key}
              </a>
            </div>

            <div class="level-item">
              <div
                class="flex is-flex-direction-column is-align-content-space-around summary">
                <div>
                  <strong
                    ><a href="/i/ticket/{$chainData.shortName}:{address}/"
                      >{$project[address].name || '...'}</a
                    ></strong>
                </div>

                {#if $project[address].when && $project[address].when.length === 2}
                  <small>
                    from {dayjs($project[address].when[0]).format('LLLL')}<br />
                    to {dayjs($project[address].when[1]).format('LLLL')}
                  </small>
                {/if}
              </div>
            </div>
          </div>

          <div class="level-right">
            <p class="level-item">
              <small>
                <a
                  href="#refresh"
                  on:keydown={keyDownA11y(() => tickets[address].load())}
                  on:click={() => tickets[address].load()}
                  disabled={loaders[address] ? true : undefined}
                  class="  "
                  ><span class="icon-text"
                    ><Icon name="Refresh" /><span>Refresh</span></span>
                </a>
              </small>
            </p>
            <p class="level-item">
              <small>
                <Confirm
                  let:activate
                  title="Remove from your tickets book?"
                  message="Are you sure you want to remove event «{$project[
                    address
                  ]
                    .name}»'s tickets from your book on this device? (you can always add them back later, it's on the blockchain!)"
                  confirmLabel="Remove"
                  on:confirm={() => project.rmBearer(address)}>
                  <a
                    on:click={activate}
                    on:keydown={keyDownA11y(activate)}
                    href="#unbookmark"
                    ><span class="icon-text"
                      ><Icon name="BookmarkOff" /><span>Remove</span></span
                    ></a>
                </Confirm>
              </small>
            </p>
          </div>
        </div>

        {#key addressesAsBearer.length}
          <Tickets
            {address}
            bind:this={tickets[address]}
            bind:loading={loaders[address]} />
        {/key}
      {/each}
    {:else}
      <EmptyState svg="/no-records.svg">
        <h3 class="subtitle"><strong>No tickets found!</strong></h3>
        <p class="help is-info">
          Switch network to see your tickets on other chains.
        </p>
      </EmptyState>
    {/if}
  {/if}
</section>

<style lang="scss">
  .summary {
    line-height: normal;
  }
</style>
