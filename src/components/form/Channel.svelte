<script>
  import { onMount } from 'svelte'

  import { chainId, chainData } from 'ethers-svelte'

  import { getChainTokens } from '$lib/blockchain.js'
  import backend from '$lib/backend.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import Waiting from '$components/Waiting.svelte'
  import Upload from '$components/Upload.svelte'

  import Accordion from '$components/design/Accordion.svelte'

  export let data
  export let edit = false

  const control = {
    isWaiting: false,
    isLoading: false,
    error: {}
  }

  let cropper
  const uploadSuccess = (event) => {
    console.log('uploadSuccess', event)
    // TDOO remove croppedVisual
    delete control.visualcroppedVisual
    delete control.error.icon

    data.icon = event.detail.src
  }

  const uploadFailure = (event) => {
    // control.error.icon = `Icon dimensions (${target.width} x ${target.height} px) is too small: a minimum 96px width is required`
    // control.error.icon = `Icon dimensions (${target.width} x ${target.height} px) is too small: a minimum 96px height is required`
    // control.error.icon = `Your ${file.type} icon should have a square ratio`

    console.log('uploadFailure', event)
  }

  export const validate = async () => {
    control.error = {}

    if (!data.label) {
      control.error.label = 'This field is required'
    }

    if (!data.supply) {
      delete data.supply
    } else {
      if (!/^\d+$/.test(data.supply)) {
        console.log(typeof data.supply, data)
        control.error.supply = 'Supply should be a number or left empty'
      }

      if (data.supply < 1) {
        control.error.supply = 'Minimum supply is 1 (leave empty for infinite)'
      }
    }

    if (!data.free) {
      if (!data.price) {
        control.error.price = 'This field is required unless ticket is free'
      }
    }

    if (Object.keys(control.error).length > 0) return false

    if (/^data:image/.test(data.icon)) {
      control.isWaiting = true
      control.loadText = edit
        ? 'Updating your channel media...'
        : 'Uploading your channel media...'

      // XXX better naming ?
      const upload = await backend.uploadFile(control.croppedIcon || data.icon)
      console.log('upload answer', upload)

      if (upload && upload.success) {
        data.icon = `ipfs://${upload.cids[0].cid}`
        control.isWaiting = false
        return true
      }

      cropper.reset()
      control.error.icon = 'Server error, please retry later'
      control.isWaiting = false
      return false
    }

    return true
  }

  $: tokens = $chainId ? getChainTokens($chainId, $chainData) : {}

  let opened

  onMount(() => {
    if (data.icon || data.max) opened = true
  })
</script>

<div class="columns is-multiline">
  <div class="column is-one-third">
    <div class="field">
      <label for="type" class="label">Channel type</label>
      <p class="control">
        <span class="select">
          <select id="type" bind:value={data.type}>
            {#each ['ticket'] as type}
              <option>{type}</option>
            {/each}
          </select>
        </span>
      </p>
    </div>
  </div>

  <div class="column is-two-thirds">
    <div class="field">
      <label for="label" class="label">Label</label>
      <p class="control">
        <input
          id="label"
          class="input"
          class:is-danger={control.error.label}
          type="text"
          placeholder="Standard Rate, Early Bird, VIP, etc"
          bind:value={data.label} />
      </p>
      {#if control.error.label}<p class="help is-danger">
          {control.error.label}
        </p>{/if}
    </div>
  </div>

  <div class="column is-one-third">
    <div class="field">
      <label for="supply" class="label">Supply available</label>
      <p class="control">
        <input
          id="supply"
          class="input"
          type="text"
          placeholder="default = no limit"
          bind:value={data.supply} />
      </p>
      {#if control.error.supply}<p class="help is-danger">
          {control.error.supply}
        </p>{/if}
    </div>
  </div>

  <div class="column is-one-quarter">
    <div class="field">
      <label for="free" class="label">Free?</label>
      <input
        id="isFree"
        type="checkbox"
        class="switch is-rtl is-outlined"
        bind:checked={data.free} />
      <label for="isFree" />
    </div>
  </div>

  {#if !data.free}
    <div class="column xis-one-quarter">
      <div class="field">
        <label for="price" class="label">Price</label>
        <p class="control">
          <input
            id="price"
            class="input"
            class:is-danger={control.error.price}
            type="text"
            placeholder="Selling price"
            bind:value={data.price} />
        </p>
        {#if control.error.price}<p class="help is-danger">
            {control.error.price}
          </p>{/if}
      </div>
    </div>

    <div class="column xis-one-quarter">
      <div class="field">
        <label for="asset" class="label">Asset</label>
        <p class="control">
          <span class="select">
            <select id="asset" bind:value={data.symbol}>
              {#each Object.keys(tokens) as symbol}
                <option>{symbol}</option>
              {/each}
            </select>
          </span>
        </p>
      </div>
    </div>
  {/if}
</div>

<Accordion
  bind:opened
  label={opened
    ? 'Hide advanced channel settings'
    : 'Show advanced channel settings'}>
  <div class="columns is-multiline">
    <div class="column is-two-thirds">
      <div class="field">
        <label for="icon" class="label">Channel icon</label>
        {#if data.icon}
          <div class="columns is-vcentered">
            <div class="column is-half">
              <figure class="image is-96x96" style="overflow: hidden;">
                {#if /^ipfs:/.test(data.icon)}
                  <img alt="channel icon" data-ipfs={data.icon} use:ipfs />
                {:else}
                  <img alt="channel icon" src={data.icon} />
                {/if}
              </figure>
            </div>
            <div class="column is-half">
              {#if false && /^data:image\/(png|jpeg|webp)/.test(data.icon)}
                <button
                  class="button is-small mb-3"
                  on:click={() => {
                    // cropActive = true
                  }}>Crop/Resize</button>
                <br />
              {/if}
              <button
                class="button is-small"
                on:click={() => {
                  data.icon = null
                }}>Remove</button>
            </div>
          </div>
        {:else}
          <Upload
            minSize="96x96"
            forceRatio={true}
            on:success={uploadSuccess}
            on:failure={uploadFailure} />
        {/if}
        <p class="has-text-centered is-size-7 py-1">
          min. size 96x96 pixels, square ratio
        </p>
        {#if control.error.icon}<p class="help is-danger">
            {control.error.icon}
          </p>{/if}
      </div>
    </div>

    <div class="column is-two-thirds" />

    <div class="column is-two-thirds">
      <div class="field">
        <label for="max" class="label">Max tickets per unique address</label>
        <p class="control">
          <input
            class="input"
            type="text"
            placeholder="default = no limit"
            bind:value={data.max} />
        </p>
        {#if control.error.max}
          <p class="help is-danger">{control.error.max}</p>
        {:else}
          <p class="help is-info">Front-end only. Not enforced onchain...</p>
        {/if}
      </div>
    </div>
  </div>
</Accordion>

<Waiting active={control.isWaiting}>
  {#if !control.loadClose}
    <progress class="progress is-small is-primary" max="100" />
  {/if}
  <p class="content">{control.loadText}</p>
  <footer class="modal-card-foot">
    {#if control.loadCancel}
      <button class="button is-black">Cancel</button>
    {/if}
    {#if control.loadClose}
      <button
        class="button is-primary"
        on:click={() => {
          control.isWaiting = false
        }}>Close</button>
    {/if}
  </footer>
</Waiting>
