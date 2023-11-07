<script>
  import { dev } from '$app/environment'

  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import Project from '$components/Project.svelte'

  import Application from '$components/form/HubApplication.svelte'

  import project from '$stores/project.js'

  export let data

  $: ({ address } = data)

  let applicationActive = false

  dayjs.extend(localizedFormat)

  $: p = $project[address] || {}

  const endpoint = import.meta.env.VITE_SPRINGBOK_ENDPOINT
  const gateway = `${endpoint}/ipfs/`


</script>

<Application bind:active={applicationActive} />

<Project {p} />

<nav class="level">
  <div class="level-item has-text-centered">
    <div>
      <p class="heading">Channels</p>
      <p class="title is-size-1">{p.channels?.length || 0}</p>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div>
      <p class="heading">Tickets distributed/sold</p>
      <p class="title is-size-1">{p.state?.acquired || 0}</p>
    </div>
  </div>
  <!-- -
       <div class="level-item has-text-centered">
       <div>
       <p class="heading">Holdings</p>
       <p class="subtitle">
       {#each Object.keys(p.balances||{}) as token}
       {p.balances[token]}<br />
       {/each}
       </p>
       </div>
       </div>
  -->
  <div class="level-item has-text-centered">
    <div>
      <p class="heading">Attendees checked-in</p>
      <p class="title is-size-1">{p.state?.redeemed || 0}</p>
    </div>
  </div>
</nav>

<article class="message is-warn">
  <div class="message-body">
    Do you want to publish this event on the Rouge Ticket Hub?

    <p>
      <button class="button" on:click={() => {applicationActive = true} }>Apply Here</button>
    </p>

  </div>
</article>

<article class="message is-info">
  <div class="message-body">
    Do you like this app? Support us and help shape the future of permissionless
    & decentralized event management. Check our
    <a target="_blank" rel="noreferrer" href="https://rouge.network/donate"
      >donate page</a
    >.
  </div>
</article>

{#if dev}
  <article class="box is-clipped">
    <p>
      <a
        target="_blank"
        rel="noreferrer"
        href={(p.uri || '').replace('ipfs://', gateway)}>{p.uri}</a>
    </p>
  </article>
{/if}

<style lang="scss">
  @import '../../../../scss/_variables.scss';

  .subtitle {
    font-weight: $weight-semibold;
    color: hsl(0, 0%, 48%);
  }

  .notification {
    background-color: #fff;
    color: #333;
    .title {
      font-size: 1.5em;
    }
  }
</style>
