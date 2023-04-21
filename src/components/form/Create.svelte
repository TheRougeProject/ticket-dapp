<script>
  import { onMount } from 'svelte'

  import { defaultEvmStores as evm } from 'ethers-svelte'

  import { authed } from '$lib/backend.js'

  import { dev } from '$app/environment'

  import { goto } from '$app/navigation'

  import Modal from '$components/Modal.svelte'
  import Project from '$components/form/Project.svelte'
  import Authed from '$components/Authed.svelte'

  import project from '$stores/project.js'

  export let active = false

  let data
  let form
  let modal

  let hasErrors = false

  const create = async () => {
    if (!(await form.validate())) {
      hasErrors = true
      return
    }
    hasErrors = false
    const address = await project.createDraft(data)
    modal.close()
    goto(`/project/${address}/draft#new`)
  }

  const cancel = async () => {
    hasErrors = false
    if (dev && evm.$chainId === 13370) {
      data = {
        online: true,
        template: 'event',
        category: 'Conference',
        when: ['2022-07-13T22:00:00.000Z', '2022-07-22T21:59:59.999Z'],
        name: 'The Rouge Protocol Conf',
        url: 'https://en.wikipedia.org/wiki/Monty_Python%27s_Flying_Circus',
        visual: 'ipfs://QmZvarkZhFWK5LA8XUrwWJEjrEgwB2LU3ng5BufekDqqcy',
        channels: [],
        _isDraft: true
      }
    } else {
      data = {
        template: 'event',
        online: true,
        channels: [],
        _isDraft: true
      }
    }
    if (modal) modal.close()
  }

  onMount(cancel)
</script>

{#if active}
  <Authed
    on:close={() => {
      if (!$authed) active = false
    }}>
    <Modal bind:this={modal} bind:active noCloseButton={true}>
      <div class="modal-card is-large">
        <section class="modal-card-body has-background-light">
          <h2 class="title">Create an event</h2>

          {#if data}<Project bind:this={form} bind:data />{/if}
        </section>
        <footer class="modal-card-foot">
          {#if hasErrors}<p class="help is-danger pr-3">
              Please fix errors above
            </p>{/if}
          <button class="button is-black" on:click={cancel}>Cancel</button>
          <button class="button is-primary" on:click={create}>Create</button>
        </footer>
      </div>
    </Modal>
  </Authed>
{/if}
