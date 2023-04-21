<script>
  import { ethers } from 'ethers'

  import { chainId } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'
  import { types } from '$lib/enums'

  export let data

  $: ({ address } = data)

  const assets = []

  const input = {
    type: 'ticket',
    free: false
  }

  const control = {
    isLoading: false,
    error: {}
  }

  const add = async () => {
    control.error = {}

    if (Object.keys(control.error).length > 0) return

    //updateMeta
    //const { success, metadata } = await backend.uploadMeta(data)
    //control.loadText = 'Uploading metadata...'

    control.loadText =
      'Adding channel... Waiting for your wallet confirmation...'

    blockchain
      .rouge($chainId)(address)
      .addChannels({
        params: [[[false, false, 0, 0, ethers.ZeroAddress]]],
        onTx: (tx) => {
          console.log('onTx', tx)
          control.loadText = `the transaction ${tx.hash} has been submitted to the blochain.`
        },
        onReceipt: (rcpt) => {
          console.log('onReceipt', rcpt)
          control.loadText = `New channel has been added!`
          // const proxy = rcpt.events.filter(e => e.event === 'ProxyCreation')[0].args.proxy
          // const res = await backend.addProject(proxy)
          // project.add(proxy)
          control.loadClose = true
        },
        onError: (err = {}) => {
          console.log('tx error', err)
          control.loadText = `Failed to add channel....`
          control.loadClose = true
        }
      })
  }
</script>

<div class="container">
  <h2 class="title">Add channel</h2>

  <div class="columns is-multiline">
    <div class="column is-one-third">
      <div class="field">
        <label class="label" for="channeltype">Channel type</label>
        <p class="control">
          <span class="select">
            <select bind:value={input.type} id="channeltype">
              {#each types as type}
                <option>{type}</option>
              {/each}
            </select>
          </span>
        </p>
      </div>
    </div>

    <div class="column is-two-thirds">
      <div class="field">
        <label class="label" for="label">Label</label>
        <p class="control">
          <input
            id="label"
            class="input"
            type="text"
            placeholder="Standard Rate, Early Bird, VIP, etc"
            bind:value={input.label} />
        </p>
        {#if control.error.when}<p class="help is-danger">
            {control.error.when}
          </p>{/if}
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field">
        <label class="label" for="supply">Quota/Max supply</label>
        <p class="control">
          <input
            class="input"
            id="supply"
            type="text"
            placeholder="default = no limit"
            bind:value={input.supply} />
        </p>
        {#if control.error.supply}<p class="help is-danger">
            {control.error.supply}
          </p>{/if}
      </div>
    </div>

    <div class="column is-one-quarter">
      <div class="field">
        <label class="label" for="isFree">Free?</label>
        <input
          id="isFree"
          type="checkbox"
          class="switch is-rtl is-outlined"
          bind:checked={input.free} />
        <label for="isFree" />
      </div>
    </div>

    {#if !input.free}
      <div class="column xis-one-quarter">
        <div class="field">
          <label class="label" for="price">Price</label>
          <p class="control">
            <input
              class="input"
              id="price"
              type="text"
              placeholder="Selling price"
              bind:value={input.price} />
          </p>
          {#if control.error.price}<p class="help is-danger">
              {control.error.price}
            </p>{/if}
        </div>
      </div>

      <div class="column xis-one-quarter">
        <div class="field">
          <label class="label" for="asset">Asset</label>
          <p class="control">
            <span class="select">
              <select bind:value={input.asset} id="asset">
                {#each assets as asset}
                  <option>{asset}</option>
                {/each}
              </select>
            </span>
          </p>
        </div>
      </div>
    {/if}
  </div>

  <button class="button is-primary" on:click={add}>Add</button>
</div>
