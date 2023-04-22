<script>
  import { ethers } from 'ethers'

  import { signerAddress, chainId } from 'ethers-svelte'

  import { abiEncodeAuth, decodeRoles } from '@rougenetwork/v2-core/rouge'

  import blockchain from '$lib/blockchain.js'
  import { formatAddress } from '$lib/utils'

  import project from '$stores/project.js'

  import Account from '$components/design/Account.svelte'
  import Slate from '$components/design/Slate.svelte'

  import Icon from '$components/Icon.svelte'
  import TxButton from '$components/TxAction/Button.svelte'

  export let data

  $: ({ address } = data)

  const control = { valid: false, error: {} }

  let delegate = $signerAddress

  $: p = $project[address] || {}

  $: ready = $signerAddress && p.setupManager

  $: delegate = control.valid ? control.delegate : $signerAddress

  $: updatable = ready ? $signerAddress === p.setupManager : false

  const actions = {}

  // loop txaction & reset them after receiving invalidation (from propagated event)
  // XXX is there a cleaner lifecyle ?
  $: if (ready) {
    for (const k of Object.keys(selectors)) {
      // console.log('test invalidation', k)
      if (actions[k]) actions[k].reset()
    }
  }

  const selectors = {
    acquire: {
      icon: 'ticket',
      label: 'Ticket sales [acquisition]',
      delegated: true
    },
    //addChannels: { icon: '', label: '', delegated: true },
    //updateAuthorizations: { icon: '', label: ', delegated: true' },
    //widthdraw: { icon: '', label: '', delegated: true },
    //widthdrawToken: { icon: '', label: '', delegated: true },
    //approveToken: { icon: '', label: '', delegated: true },
    redeem: {
      icon: 'scanQr',
      label: 'Ticket scanner [redemption]',
      delegated: true
    }
  }

  let roles
  const refresh = async () => {
    if (!control.delegate) return
    const raw = await decodeRoles(
      blockchain.rouge($chainId)(address),
      Object.keys(selectors),
      control.delegate,
      p.channels
    )
    roles = raw[p.channels.length]
  }
  const check = () => {
    control.valid = true
    refresh()
  }

  const authorizeCtx = (selector, grant, delegate = ethers.ZeroAddress) => {
    const contract = blockchain.rouge($chainId)(address)
    const auths = [
      {
        scope: contract.interface.getFunction(selector).selector,
        address: delegate,
        grant
      }
    ].map((a) => abiEncodeAuth(a))
    return {
      label: 'Transaction tracker...',
      call: contract.updateAuthorizations,
      params: [auths]
    }
  }
</script>

<h2 class="title">State</h2>

<Slate>
  <span class="icon-text">
    <Icon name="UserExclamation" />
    <span>Manager at creation</span>
  </span>

  <div slot="info">
    <Account address={p.setupManager} />
  </div>
</Slate>

{#if ready && !updatable}
  <article class="message is-danger">
    <div class="message-body">
      You are not a manager of this event, so you cannot change its state
    </div>
  </article>
{/if}

<h2 class="title">global permissions</h2>

{#each Object.keys(selectors) as k}
  <Slate>
    <span class="icon-text">
      <Icon name={selectors[k].icon} />
      <span>{selectors[k].label}</span>
    </span>

    <div slot="info">
      {#if p.state.enabled[k]}
        <span class="icon-text has-text-success">
          <Icon name="Check" />
          <p class="subtitle heading pl-2">enabled</p>
        </span>
      {:else}
        <span class="icon-text has-text-danger">
          <Icon name="Lock" />
          <p class="subtitle heading pl-2">disabled</p>
        </span>
      {/if}
    </div>

    <div slot="actions">
      <TxButton
        bind:this={actions[k]}
        class="button is-outlined is-primary"
        disabled={!updatable}
        disabledHelp="no permissions"
        submitCtx={() => authorizeCtx(k, !p.state.enabled[k])}>
        {#if p.state.enabled[k]}Disable{:else}Enable{/if}
      </TxButton>
    </div>
  </Slate>
{/each}

<p class="mt-4">
  You can also check {#if updatable}and update {/if} authorizations for specific
  address
</p>

<div class="field has-addons">
  <div class="control">
    <input
      bind:value={control.delegate}
      class="input"
      type="text"
      size="50"
      placeholder="Ethereum address" />
  </div>
  <div class="control">
    <button class="button is-black" on:click={check}> Check </button>
  </div>
  {#if control.error.selected}<p class="help is-danger">
      {control.error.selected}
    </p>{/if}
</div>

{#if control.valid && roles}
  <h2 class="title">{formatAddress(delegate)} authorizations</h2>

  {#each Object.keys(selectors) as k}
    <Slate>
      <span class="icon-text">
        <Icon name={selectors[k].icon} />
        <span>{selectors[k].label}</span>
      </span>

      <div slot="info">
        {#if roles[k]}
          <span class="icon-text has-text-success">
            <Icon name="Check" />
            <p class="subtitle heading pl-2">authorized</p>
          </span>
        {:else}
          <span class="icon-text has-text-danger">
            <Icon name="lock" />
            <p class="subtitle heading pl-2">unauthorized</p>
          </span>
        {/if}
      </div>

      <div slot="actions">
        <TxButton
          on:success={refresh}
          class="button is-outlined is-primary"
          disabled={!updatable}
          disabledHelp="no permissions"
          submitCtx={() => authorizeCtx(k, !roles[k], delegate)}>
          {#if roles[k]}Unauthorize{:else}Authorize{/if}
        </TxButton>
      </div>
    </Slate>
  {/each}
{/if}
