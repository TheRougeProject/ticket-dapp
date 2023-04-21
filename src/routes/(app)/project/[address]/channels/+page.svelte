<script>
  import project from '$stores/project.js'
  import { ipfs } from '$lib/actions/ipfs.js'

  import EmptyState from '$components/design/EmptyState.svelte'
  import Slate from '$components/design/Slate.svelte'
  import Address from '$components/design/Address.svelte'
  import Icon from '$components/Icon.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}
</script>

<h2 class="title">Distribution channels</h2>

{#if p.channels && p.channels.length}
  {#if !p._isDraft}
    <article class="message is-warning">
      <div class="message-body">
        You cannot edit channels after publishing in this beta version.
      </div>
    </article>
  {/if}

  {#each p.channels as channel, i}
    <Slate>
      <nav class="level">
        <div class="level-left">
          {#if channel.icon}
            <div class="level-item">
              <figure class="image is-48x48">
                <img
                  alt="{channel.label} icon"
                  data-ipfs={channel.icon}
                  use:ipfs />
              </figure>
            </div>
          {/if}
          <div class="level-item">
            <p class="subtitle">
              {channel.label}{#if channel.supply}&nbsp;x{channel.supply}{/if}
            </p>
          </div>
        </div>
      </nav>

      <div slot="info">
        {#if channel.amount?.token?.address}
          <Address address={channel.amount?.token?.address}>
            <span class="icon-text">
              <span>{channel.amount?.toString()}</span><Icon
                name="ExternalLink" />
            </span>
          </Address>
        {:else}
          {channel.amount?.toString() || 'free'}
          {#if channel.max}
            (max/address = {channel.max})
          {/if}
        {/if}
      </div>

      <div slot="actions">
        <a
          disabled={p._isDraft ? undefined : true}
          class="button is-outlined is-primary"
          href="/project/{address}/channel/{i}">edit</a>
      </div>
    </Slate>
  {/each}
{:else}
  <EmptyState svg="/empty-box.svg">
    <h3 class="subtitle"><strong>No channels.</strong></h3>
    <a class="button is-primary" href="/project/{address}/add-channel/"
      >Add your first channel</a>
  </EmptyState>
{/if}
