<script>
  import { onMount } from 'svelte'

  import { chainId } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'

  import project from '$stores/project.js'
  import nft from '$stores/nft.js'

  import EmptyState from '$components/design/EmptyState.svelte'
  import Slate from '$components/design/Slate.svelte'
  import Account from '$components/design/Account.svelte'
  import Icon from '$components/Icon.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  let nfts = []
  let loaded = false

  onMount(async () => {
    const contract = blockchain.rouge($chainId)(address)
    // need initial cache system counting from block X
    // useless with last tokenId

    // TODO async when ticket count > X 100?

    const events = await contract.queryFilter(contract.filters.Acquired(), 0)
    for (const e of events) {
      nfts = [...nfts, e.args.tokenId]
    }
    loaded = true
  })

  let control = { error: {} }

  let selected

  // TODO onMount => loop several times .. to fix
  let filterType
  let filterParams = {}
  const clear = () => {
    filterType = undefined
    filterParams = {}
    selected = undefined
  }
  const filter0 = (params, filterType) => (tokenId) => {
    if (filterType === 'id' && filterParams.id && tokenId !== filterParams.id)
      return false
    if (filterType === 'address' && filterParams.address) {
      const re = new RegExp(filterParams.address, 'i')
      if (!re.test($nft[`${address}:${tokenId}`].owner)) {
        return false
      }
    }
    if (filterType === 'channel' && filterParams.label != null) {
      // console.log('***', tokenId, Object.values(params))
      if ($nft[`${address}:${tokenId}`].channelId !== filterParams.label)
        return false
    }
    return true
  }

  $: filter = filter0(filterParams, filterType)
</script>

<h2 class="title">Attendees</h2>

<div
  class="tabs is-boxed is-toggle"
  class:is-active={!!selected}
  class:is-on={!!filterType}>
  <ul>
    <li class:is-active={selected === 'filter'}>
      <a
        href="#filter"
        on:click={() => {
          selected = selected === 'filter' ? undefined : 'filter'
        }}>
        <Icon name="Filter" class="is-medium" />
        <span>Filter</span>
      </a>
    </li>
    {#if false && p.channels.length > 1}
      <li class:is-active={selected === 'group'}>
        <a
          href="#group"
          on:click={() => {
            selected = selected === 'group' ? undefined : 'group'
          }}>
          <Icon name="BoxMultiple" class="is-medium" />
          <span>Group</span>
        </a>
      </li>
    {/if}
    <li>
      <a href="#clear" on:click={clear}>
        <Icon name="FilterOff" class="is-medium" />
        <span>Clear</span>
      </a>
    </li>
  </ul>
</div>
<div class="box filter-box" class:is-active={!!selected}>
  <div class="columns is-multiline">
    <div class="column is-one-fifth">
      <div class="field">
        <label class="label"
          ><input
            bind:group={filterType}
            class="mr-1"
            type="radio"
            name="filter"
            value="id" />by id</label>
        <p class="control">
          <input
            class="input"
            on:change={() => {
              filterType = 'id'
            }}
            class:is-danger={control.error.label}
            type="number"
            min="1"
            max={nfts.length}
            bind:value={filterParams.id} />
        </p>
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field">
        <label class="label"
          ><input
            bind:group={filterType}
            class="mr-1"
            type="radio"
            name="filter"
            value="address" />by address</label>
        <p class="control">
          <input
            class="input"
            on:change={() => {
              filterType = 'address'
            }}
            class:is-danger={control.error.label}
            type="text"
            bind:value={filterParams.address} />
        </p>
      </div>
    </div>

    {#if p.channels.length > 1}
      <div class="column is-one-third">
        <div class="field">
          <label class="label"
            ><input
              bind:group={filterType}
              class="mr-1"
              type="radio"
              name="filter"
              value="channel" />by channel</label>
          <p class="control">
            <span
              class="select"
              on:change={() => {
                filterType = 'channel'
              }}>
              <select bind:value={filterParams.label}>
                <option value={null}>--all--</option>
                {#each p.channels || [] as channel, i}
                  <option value={i}>{channel.label}</option>
                {/each}
              </select>
            </span>
          </p>
        </div>
      </div>
    {/if}
  </div>
  <!--
  <div class="column is-one-quarter">
    <div class="field">
      <label class="label">Group by channel</label>
      <input id="group" type="checkbox" class="switch is-rtl is-outlined" bind:checked>
      <label for="group" />
    </div>
  </div>
-->
</div>

{#if nfts.length === 0 && loaded}
  <EmptyState svg="/empty-box.svg">
    <h3 class="subtitle"><strong>No attendees yet!</strong></h3>
    <p class="help is-info">No ticket have been sold...</p>
  </EmptyState>
{:else}
  {#each nfts.filter(filter) as tokenId}
    <Slate>
      <p class="subtitle">#{tokenId}</p>

      <div slot="info">
        <Account address={$nft[`${address}:${tokenId}`].owner} />
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

<style lang="scss">
  @import '../../../../../scss/_variables.scss';
  @import 'bulma/sass/utilities/_all';

  .tabs.is-toggle {
    li:not(:last-child) a {
      background-color: $primary;
      color: #fff;
      border-color: none;
    }

    li:nth-last-child(2) a {
      border-bottom-right-radius: 4px;
    }
    li:last-child a {
      display: none;
    }

    &.is-active {
      margin-bottom: 0;
      li:first-child a {
        border-bottom-left-radius: 0;
      }
      li:nth-last-child(2) a {
        border-bottom-right-radius: 0;
      }
    }

    &.is-on {
      li:last-child a {
        display: flex;
      }
    }

    @include tablet {
      margin-bottom: 0;
      li:first-child a {
        border-bottom-left-radius: 0;
      }
    }
  }
  .box.filter-box {
    label {
      color: #fff;
    }
    @include tablet {
      background-color: $primary;
      color: #fff;
      border-top-left-radius: 0;
    }
    @include mobile {
      display: none;

      &.is-active {
        display: block;
        background-color: $primary;
        color: #fff;
        border-top-left-radius: 0;
      }
    }
  }
</style>
