<script>
  import { onMount } from 'svelte'

  import { goto } from '$app/navigation'

  import project from '$stores/project.js'

  import Project from '$components/form/Project.svelte'

  export let address

  let form
  let input

  export let data

  $: ({ address } = data)

  let hasErrors = false

  $: p = $project[address] || {}

  const save = async () => {
    if (!(await form.validate())) {
      hasErrors = true
      return
    }
    hasErrors = false

    project.updateDraft(address, {
      ...input,
      channels: p.channels
    })
    project.refresh(address)

    goto(`/project/${address}/draft`)
  }

  onMount(() => {
    input = JSON.parse(JSON.stringify($project[address]))
  })
</script>

<h2 class="title">Edit your event</h2>

{#if input?.when}
  <Project bind:this={form} bind:data={input} edit={true} />
{/if}

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
      <button class="button is-primary" on:click={save}>Save</button>
    </div>
  </div>
</div>
