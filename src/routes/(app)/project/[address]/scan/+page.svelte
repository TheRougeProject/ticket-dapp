<script>
  import project from '$stores/project.js'

  import { signerAddress } from 'ethers-svelte'

  import CheckIn from '$components/CheckIn.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  // XXX simplified auth map
  $: rw =
    $signerAddress && p.setupManager ? $signerAddress === p.setupManager : false
</script>

<h2 class="title">Check-in / tickets scanner</h2>

{#if !rw}
  <article class="message is-danger">
    <div class="message-body">
      You are not a manager of this event, so you cannot change its state
    </div>
  </article>
{/if}

<CheckIn {p} {rw} />
