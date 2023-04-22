<script>
  import Mustache from 'mustache'
  import { chainId, chainData } from 'ethers-svelte'

  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'

  import backend from '$lib/backend.js'
  import blockchain from '$lib/blockchain.js'
  import { ipfs } from '$lib/actions/ipfs.js'

  import { abiEncodeAuth, abiEncodeChannel } from '@rougenetwork/v2-core/rouge'

  import project from '$stores/project.js'

  import Project from '$components/Project.svelte'
  import Icon from '$components/Icon.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'
  import Confirm from '$components/design/Confirm.svelte'
  import Waiting from '$components/Waiting.svelte'
  import TxButton from '$components/TxAction/Button.svelte'
  import Slate from '$components/design/Slate.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  const deleteChannel = (i) => {
    project.updateDraft(address, {
      ...p,
      channels: p.channels.filter((c, j) => j !== i)
    })
    project.refresh(address)
  }

  const control = {}

  const buildImage = async () => {
    // console.log({ p })

    const template = ' eee {{ x }} fff '
    var rendered = Mustache.render(template, { x: 'Luke' })
    console.log(rendered)
  }

  // TODO move publish to its own lib
  const publishCtx = async () => {
    try {
      control.isLoading = true
      control.loadText = 'Uploading metadata...'

      const data = { ...p }
      Object.keys(data)
        .filter((k) => /^_/.test(k))
        .forEach((k) => delete data[k])

      const { success, cids } = await backend.uploadMeta(data)

      if (!success || !cids || cids.length !== 1)
        throw new Error('springbok error')

      // console.log({ success, cids })

      const auths = [
        {
          scope: blockchain.singleton($chainId).interface.getFunction('acquire')
            .selector,
          enable: true
        },
        {
          scope: blockchain.singleton($chainId).interface.getFunction('redeem')
            .selector,
          enable: true
        }
      ].map((a) => abiEncodeAuth(a))

      control.isLoading = false

      console.log('channels before encode', data.channels)

      return {
        call: blockchain.createProjet,
        URI: `ipfs://${cids[0].cid}`,
        channels: data.channels.map((v) => abiEncodeChannel(v)),
        auths,
        onReceipt: async (rcpt) => {
          // control.loadText = `Your project has been created!`
          const instance = blockchain.factory($chainId)
          const events = await instance.queryFilter(
            instance.filters.ProxyCreation(),
            rcpt.blockNumber
          )
          for (const e of events) {
            if (e.transactionHash !== rcpt.hash) continue
            const proxy = e.args.proxy
            project.add(proxy)
            project.deleteDraft(address)
            // projet page in charge of waiting infos loaded ?
            goto(`/project/${proxy}/`)
          }
        }
      }
    } catch (err) {
      console.log('publishCtx err ', err)
      control.hasError = true
      control.loadText = 'Failed to upload your data...'
      control.loadClose = true
    }
  }
</script>

{#if browser && window.location.hash === 'new'}
  <article class="message is-primary">
    <div class="message-body">Your draft event has been created!</div>
  </article>
{/if}

<Project {p} edit={true} />

<article class="message is-warning">
  <div class="message-body">
    <a
      class="button is-small is-primary is-outlined is-pulled-right clearfix"
      href="/project/{address}/edit/">Edit</a>
    {#if !p.visual}
      <span class="icon-text"
        ><Icon name="alert-circle" /><span
          >Your event has no main visual! It is recommended to add a high
          quality visual.</span
        ></span>
    {:else}
      <span class="icon-text"
        ><Icon name="InfoCircle" /><span
          >You may edit your draft event as much as you want before publishing.</span
        ></span>
    {/if}
  </div>
</article>

{#if p.channels && p.channels.length}
  <h2 class="title">Ticket sales channel(s)</h2>

  {#each p.channels as channel, i}
    <Slate>
      <nav class="level subtitle">
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
        {channel.amount?.toString() || 'free'}
      </div>

      <div slot="actions">
        <p class="level-item">
          <button
            class="button is-small is-ghost"
            on:click={() => goto(`/project/${address}/channel/${i}`)}>
            <Icon name="Edit" class="mr-1" />Edit
          </button>
        </p>
        <Confirm
          let:activate
          title="Delete ticket sales channel"
          message="Are you sure you want to delete the ticket sales channel {channel.label}? This action cannot be undone."
          confirmLabel="Delete"
          on:confirm={() => deleteChannel(i)}>
          <p class="level-item">
            <button class="button is-small is-ghost" on:click={activate}>
              <Icon name="Trash" class="mr-1" />Delete
            </button>
          </p>
        </Confirm>
      </div>
    </Slate>
  {/each}

  <div class="level slate">
    <div class="level-left" />
    <div class="level-right">
      <div class="level-item">
        <button
          class="button is-small is-primary"
          on:click={() => goto(`/project/${address}/add-channel/`)}
          >Add channel</button>
      </div>
    </div>
  </div>
{:else}
  <EmptyState svg="/empty-box.svg">
    <h3 class="subtitle"><strong>No tickets yet!</strong></h3>
    <a class="button is-primary" href="/project/{address}/add-channel/"
      >Add your first channel</a>
    <p class="help is-info">
      You need to create at least one ticket sales channel.
    </p>
  </EmptyState>
{/if}

{#if p.channels.length}
  <h2 class="title">Publish your event</h2>

  <article class="message is-danger">
    <div class="message-body">
      In this beta version of Rouge Ticket, you cannot add or modify channels or
      change metadata of your event after publish.
    </div>
  </article>

  <p>Your event will be deployed on : {$chainData.name}</p>

  <div class="level slate">
    <div class="level-left" />
    <div class="level-right">
      <div class="level-item">
        <h3>
          <TxButton class="button is-primary" submitCtx={publishCtx}
            >Publish your event</TxButton>
        </h3>
      </div>
    </div>
  </div>
{/if}

{#if false}
  <button class="button is-primary" on:click={buildImage}>Test image</button>
{/if}

<Waiting active={!!control.isLoading}>
  {#if !control.hasError}
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
          control.isLoading = false
        }}>Close</button>
    {/if}
  </footer>
</Waiting>
