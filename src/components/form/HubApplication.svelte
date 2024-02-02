<script>
  import dayjs from 'dayjs'

  import backend from '$lib/backend.js'

  import Modal from '$components/Modal.svelte'
  import Waiting from '$components/Waiting.svelte'

  let modal

  export let data = {}
  export let active = false

  export const control = {
    isWaiting: false,
    error: {},
    warned: {}
  }

  export const cancel = async () => {
    control.error = {}
    active = false

  }

  export const validate = async () => {
    control.error = {}

    if (!data.name) {
      control.error.name = 'This field is required'
    }

    if (!data.email) {
      control.error.email = 'This field is required'
    }

    if (Object.keys(control.error).length > 0) return false


    /* send request */


  }
</script>


<Modal bind:this={modal} bind:active noCloseButton={true}>

  <div class="modal-card is-large">
    <section class="modal-card-body has-background-light">
      <h2 class="title">Submit Hub application</h2>

      <h3 class="subtitle mt-4">Organizer</h3>

      <div class="columns is-multiline">
        <div class="column is-two-thirds">
          <div class="field">
            <label for="name" class="label">Name</label>
            <p class="control">
              <input
                id="name"
                class:is-danger={control.error.name}
                    class="input"
                type="text"
                placeholder="Person or company organizing the event (required)"
                bind:value={data.name} />
            </p>
            {#if control.error.name}<p class="help is-danger">
              {control.error.name}
            </p>{/if}
          </div>
        </div>
      </div>

      <div class="columns is-multiline">
        <div class="column is-two-thirds">
          <div class="field">
            <label for="name" class="label">Email</label>
            <p class="control">
              <input
                id="name"
                class:is-danger={control.error.name}
                    class="input"
                type="email"
                placeholder="How can we contact you (required)"
                bind:value={data.name} />
            </p>
            {#if control.error.name}<p class="help is-danger">
              {control.error.name}
            </p>{/if}
          </div>
        </div>
      </div>

    </section>
    <footer class="modal-card-foot">
      {#if Object.keys(control.error).length > 0}<p class="help is-danger pr-3">
        Please fix errors above
      </p>{/if}
      <button class="button is-black" on:click={cancel}>Cancel</button>
      <button class="button is-primary" on:click={validate}>Submit</button>
    </footer>
  </div>

</Modal>

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
