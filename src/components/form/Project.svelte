<script>
  import { getContext } from 'svelte'

  import dayjs from 'dayjs'

  import backend from '$lib/backend.js'

  import { categories, visuals } from '$lib/visuals.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import Calendar from '$components/Calendar/index.svelte'
  import Waiting from '$components/Waiting.svelte'
  import Upload from '$components/Upload.svelte'

  const mobile = getContext('mobile')

  export let data = {}
  export let edit = false

  export const control = {
    isWaiting: false,
    error: {},
    warned: {}
  }

  const uploadSuccess = (event) => {
    console.log('uploadSuccess', event)
    // TDOO remove croppedVisual
    delete control.croppedVisual
    delete control.error.visual

    data.visual = event.detail.src
  }

  const uploadFailure = (event) => {
    console.log('uploadFailure', event)
  }

  let mark = 1

  $: defaultVisuals = mark
    ? (categories[data.category] || []).map((h) => `ipfs://${visuals[h].cid}`)
    : []

  export const validate = async () => {
    control.error = {}

    if (!data.name) {
      control.error.name = 'This field is required'
    }

    if ($mobile) {
      data.when = [data.when1, data.when2]
    }

    if (!data.visual && !control.croppedVisual) {
      control.error.visual = 'A main visual is required'
    }

    if (!data.when[0] || !data.when[1]) {
      control.error.when =
        'Event starting and ending date and time are all required'
    } else {
      const from = dayjs(data.when[0])
      const to = dayjs(data.when[1])

      if (to.isBefore(from)) {
        control.error.when = 'Event ending date and time must be after start'
        return false
      }

      if (!edit && from.isBefore(dayjs()) && !control.warned.date) {
        control.error.when =
          'Your event start in the past. If you are sure, click again...'
        control.warned.date = true
        return false
      }
    }

    if (!data.online) {
      if (!data.address) {
        control.error.address = 'This field is required'
      }
      if (!data.postalCode) {
        control.error.postalCode = 'This field is required'
      }
      if (!data.city) {
        control.error.city = 'This field is required'
      }
      if (!data.country) {
        control.error.country = 'This field is required'
      }
    }

    if (data.url && !/^(https?|ipfs):/.test(data.url)) {
      data.url = 'http://' + data.url
    }

    if (Object.keys(control.error).length > 0) return false

    if (control.croppedVisual) data.visual = control.croppedVisual

    if (/^data:image/.test(data.visual)) {
      control.isWaiting = true
      control.loadText = edit
        ? 'Updating your draft event...'
        : 'Creating your draft event...'

      const upload = await backend.uploadFile(data.visual)

      if (upload && upload.success) {
        if (data._isDraft) {
          data.visual = `ipfs://${upload.cids[0].cid}`
          return true
        } else {
          // todo
        }
      }
      control.error.visual = 'Server error, please retry later'
      control.isWaiting = false
      return false
    }

    return true
  }
</script>

<h3 class="subtitle mt-4">When?</h3>

<div class="columns is-multiline">
  {#if $mobile}
    <div class="column is-full">
      <div class="field">
        <label for="when1" class="label">From</label>
        <p class="control" class:has-error={control.error.when}>
          <input
            id="when1"
            class:is-danger={control.error.when}
            class="input"
            type="datetime-local"
            placeholder="Event start date & time"
            on:change={() => {
              control.warned.date = false
            }}
            bind:value={data.when1} />
        </p>
      </div>
    </div>
    <div class="column is-full">
      <div class="field">
        <label for="when2" class="label">To</label>
        <p class="control" class:has-error={control.error.when}>
          <input
            id="when2"
            class:is-danger={control.error.when}
            class="input"
            type="datetime-local"
            placeholder="Evenr end date & time"
            on:change={() => {
              control.warned.date = false
            }}
            bind:value={data.when2} />
        </p>
        {#if control.error.when}<p class="help is-danger">
            {control.error.when}
          </p>{/if}
      </div>
    </div>
  {:else}
    <div class="column is-full">
      <div class="field">
        <label for="when" class="label">Date & time</label>
        <p class="control" class:has-error={control.error.when}>
          <Calendar
            id="when"
            type="datetime"
            bind:value={data.when}
            isRange={true}
            on:changed={() => {
              control.warned.date = false
            }} />
        </p>
        {#if control.error.when}<p class="help is-danger">
            {control.error.when}
          </p>{/if}
      </div>
    </div>
  {/if}
</div>

<!-- - todo timezone  -->

<h3 class="subtitle mt-4">What?</h3>

<div class="columns is-multiline">
  <div class="column is-two-thirds">
    <div class="field">
      <label for="name" class="label">Name of your event</label>
      <p class="control">
        <input
          id="name"
          class:is-danger={control.error.name}
          class="input"
          type="text"
          placeholder="A not too long description title for your event (required)"
          bind:value={data.name} />
      </p>
      {#if control.error.name}<p class="help is-danger">
          {control.error.name}
        </p>{/if}
    </div>
  </div>

  <div class="column is-one-third">
    <div class="field">
      <label for="category" class="label">Category</label>
      <p class="control">
        <span class="select">
          <select
            id="category"
            bind:value={data.category}
            on:change={() => {
              mark++
            }}>
            <option />
            {#each Object.keys(categories) as category}
              <option>{category}</option>
            {/each}
          </select>
        </span>
      </p>
    </div>
  </div>

  {#if !data.visual && !control.croppedVisual}
    <div class="column is-full pb-0">
      <div class="field">
        <label for="visual" class="label">Select your main event visual</label>
        {#if control.error.visual}<p class="help is-danger">
            {control.error.visual}
          </p>{/if}
      </div>
    </div>
    {#key defaultVisuals}
      {#each defaultVisuals as visual}
        <div class="column pt-1 is-one-third">
          <p class="has-text-centered">
            <label>
              <input
                class="is-hidden"
                type="radio"
                bind:group={data.visual}
                name="visualDefault"
                value={visual} />
              <span class="button is-small mb-1">Select</span>
              <figure class="image is-16by9">
                <img
                  alt="default visual"
                  data-ipfs={visual}
                  style="object-fit: cover;"
                  use:ipfs />
              </figure>
            </label>
          </p>
        </div>
      {/each}
    {/key}
    <div class="column pt-1 is-one-third">
      <div class="is-16by9">
        <Upload
          minSize="768x432"
          forceRatio={true}
          on:success={uploadSuccess}
          on:failure={uploadFailure} />
      </div>
      <p class="has-text-centered is-size-7 py-1">
        min. size 768x432 pixels, 16:9 ratio
      </p>
    </div>
  {:else}
    <div class="column is-full">
      <div class="field">
        <label for="visual" class="label">Main visual</label>
      </div>
      <nav class="level">
        <div class="level-item has-text-centered">
          <button
            class="button is-small"
            on:click={() => {
              delete data.visual
              control.croppedVisual = null
            }}>Change visual</button>
        </div>
        {#if control.croppedVisual}
          <div class="level-item has-text-centered">
            <button
              class="button is-small mb-3"
              disabled={!/^data/.test(data.visual) || undefined}
              on:click={() => {
                // TODO cropActive = true
              }}>Crop/Resize</button>
          </div>
        {/if}
      </nav>
      <figure class="image is-16by9 viewer">
        {#if /^ipfs:/.test(data.visual)}
          <img
            alt="main visual"
            data-ipfs={data.visual}
            style="object-fit: cover;"
            use:ipfs />
        {:else}
          <img
            alt="main visual"
            src={control.croppedVisual || data.visual}
            style="object-fit: cover;" />
        {/if}
      </figure>
    </div>
  {/if}
</div>

<h3 class="subtitle mt-4">test?</h3>

<h3 class="subtitle mt-4">Where?</h3>
<div class="columns is-multiline">
  <div class="column is-one-third">
    <div class="field">
      <label for="isOnline" class="label">Online?</label>
      <input
        id="isOnline"
        type="checkbox"
        class="switch is-rtl is-outlined"
        bind:checked={data.online} />
      <label for="isOnline" />
    </div>
  </div>

  {#if !data.online}
    <div class="column is-two-thirds">
      <div class="field">
        <label for="venue" class="label">Venue</label>
        <p class="control">
          <input id="venue" class="input" type="text" bind:value={data.venue} />
        </p>
        {#if control.error.venue}<p class="help is-danger">
            {control.error.venue}
          </p>{/if}
      </div>
    </div>

    <div class="column is-two-thirds">
      <div class="field">
        <label for="address" class="label">Address</label>
        <p class="control">
          <input
            id="address"
            class:is-danger={control.error.address}
            class="input"
            type="text"
            bind:value={data.address} />
        </p>
        {#if control.error.address}<p class="help is-danger">
            {control.error.address}
          </p>{/if}
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field">
        <label for="postal" class="label">Postal code</label>
        <p class="control">
          <input
            id="postal"
            class:is-danger={control.error.postalCode}
            class="input"
            type="text"
            bind:value={data.postalCode} />
        </p>
        {#if control.error.postalCode}<p class="help is-danger">
            {control.error.postalCode}
          </p>{/if}
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field">
        <label for="city" class="label">City</label>
        <p class="control">
          <input
            id="city"
            class:is-danger={control.error.city}
            class="input"
            type="text"
            bind:value={data.city} />
        </p>
        {#if control.error.city}<p class="help is-danger">
            {control.error.city}
          </p>{/if}
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field">
        <label for="country" class="label">Country</label>
        <p class="control">
          <input
            id="country"
            class:is-danger={control.error.country}
            class="input"
            type="text"
            bind:value={data.country} />
        </p>
        {#if control.error.country}<p class="help is-danger">
            {control.error.country}
          </p>{/if}
      </div>
    </div>
  {:else}
    <div class="column is-two-thirds">
      <div class="field">
        <label for="url" class="label">URL</label>
        <p class="control">
          <input
            id="url"
            class:is-danger={control.error.url}
            class="input"
            type="text"
            bind:value={data.url} />
        </p>
        {#if control.error.url}<p class="help is-danger">
            {control.error.url}
          </p>{/if}
      </div>
    </div>
  {/if}
</div>

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

<style>
  .viewer {
    border: 1px solid #ddd;
  }
</style>
