<script>
  import { dev } from '$app/environment'

  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import Project from '$components/Project.svelte'

  import project from '$stores/project.js'

  export let data

  $: ({ address } = data)

  dayjs.extend(localizedFormat)

  $: p = $project[address] || {}

  const endpoint = import.meta.env.VITE_SPRINGBOK_ENDPOINT
  const gateway = `${endpoint}/ipfs/`
</script>

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

{#if false}
  <article class="message is-info">
    <div class="message-body">
      Do you like the app? Support the project by donating to
      <a
        target="_blank"
        rel="noreferrer"
        data-beta="https://grant-explorer.gitcoin.co/#/round/1/0xd95a1969c41112cee9a2c931e849bcef36a16f4c/0xad3348a8338210c5d7eca4187a0267507d9dd8683fe02d253c4a17a952c5ef3c-0xd95a1969c41112cee9a2c931e849bcef36a16f4c"
        href="https://gitcoin.co/grants/7519/rouge-ticket">our Gitcoin grant</a
      >. Unleash quadratic funding and verify your passport to match funds!
    </div>
  </article>
{/if}

{#if dev}
  <article class="box is-clipped">
    <p>
      <a
        target="_blank"
        rel="noreferrer"
        href={(p.uri || '').replace('ipfs://', gateway)}>{p.uri}</a>
    </p>
    <p><a href="/i/special/foxwallet/">foxwallet</a></p>
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
