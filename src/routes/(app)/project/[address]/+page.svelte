<script>
  import { dev } from '$app/environment'

  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import Project from '$components/Project.svelte'

  import project from '$stores/project.js'
  //import { toHexString } from '$lib/utils.js'

  export let data

  $: ({ address } = data)

  dayjs.extend(localizedFormat)

  $: p = $project[address] || {}

  const endpoint = import.meta.env.VITE_SPRINGBOK_ENDPOINT
  const gateway = `${endpoint}/ipfs/`

  const test = () => {
    //   // Object { draftNonce: 1 }
    //   const draftNonce = 1
    //   //toHexString(draftNonce)
    //   //invalid BytesLike value (argument="value", value="0x1", code=INVALID_ARGUMENT, version=6.3.0)
    //   console.log(draftNonce)
    //
    //   const address = toHexString(draftNonce, 40)
    //   console.log(address)
  }
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

{#if true}
  <article class="message is-info">
    <div class="message-body">
      Do you like this app? Support us and help shape the future of
      permissionless & decentralized event management. You can donate to Rouge
      Ticket on <a
        target="_blank"
        rel="noreferrer"
        href="https://explorer.gitcoin.co/#/round/1/0x12bb5bbbfe596dbc489d209299b8302c3300fa40/0x12bb5bbbfe596dbc489d209299b8302c3300fa40-28"
        >the Gitcoin Grants Beta Round</a
      >. Don't forget, every donation is amplified by Quadratic Funding if your
      verify your "Gitcoin Passport", making your contributions even more
      valuable.
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

    <button class="button" on:click={test}>test</button>
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
