<script>
  import { createEventDispatcher } from 'svelte'

  import { chainData, signer } from 'ethers-svelte'

  import { explorer } from '$lib/utils.js'

  import tracker from '$stores/tracker.js'

  import Icon from '$components/Icon.svelte'

  const dispatch = createEventDispatcher()

  /*

     steps shoudl follow a tx from submission to completion or failure

     "completion or failure" => need handler & id for that
     also centralized in common state for history & reload

     similar to notify ..

   */
  export let submitCtx

  export let disabled
  export let disabledHelp
  let importedClasses = ''
  export { importedClasses as class }

  let check = {}
  let callId

  const submit = async () => {
    const ctx = await submitCtx()
    if (typeof ctx !== 'object') return

    // console.log(ctx)
    // XXX more checks ?
    // params is not really defined in specs, use options ?
    if (ctx.params && ctx.params.length > 1) {
      const options = ctx.params[ctx.params.length - 1]
      if (typeof options === 'object' && options.value) {
        const balance = await $signer.getBalance()
        if (balance.lt(options.value)) {
          check.err = true
          check.errMsg = `Not enough ${$chainData.nativeCurrency.name} in your wallet!`
          dispatch('error')
          return
        }
      }
    }

    callId = tracker.submit({
      ...ctx,
      onReceipt: (rcpt) => {
        console.log('[%s] onReceipt', callId, rcpt)
        dispatch('success', rcpt)
        if (ctx.onReceipt) ctx.onReceipt(rcpt)
      },
      onError: (err, rcpt = {}) => {
        console.log('[%s] onError', callId, err, rcpt)
        dispatch('error', err, rcpt)
        if (ctx.onError) ctx.onError(err, rcpt)
      }
    })
    console.log('receive callId form tracker', callId)
  }

  const reset = () => {
    callId = null
    check = {}
  }

  $: call = $tracker[callId] || {}
</script>

<div class="field">
  {#if call.err || check.err}
    <button class="button is-outlined is-info" on:click={reset}>
      Try again?
    </button>
  {:else}
    <button
      disabled={disabled || call.step ? true : false}
      class={importedClasses}
      on:click={submit}>
      <slot />
    </button>
  {/if}
  <p class="help">
    {#if disabled && disabledHelp}
      {disabledHelp}
    {:else if check.err}
      <span class="icon-text is-warning">
        <span>{check.errMsg || 'checks failed'}</span>
        <Icon name="ThumbDown" />
      </span>
    {:else if call.err}
      <span class="icon-text is-danger">
        <span>{call.errMsg || 'tx failed'}</span>
        <Icon name="ThumbDown" />
      </span>
    {:else if call.step === 1}
      <span class="icon-text" /><span>waiting wallet</span><span class="icon"
        ><span class="loader" />
      </span>
    {:else if call.step === 2}
      <span class="icon-text">
        <span class="icon mr-0"><span class="pending" /></span>
        <a
          rel="noreferrer"
          target="_blank"
          href={explorer($chainData, 'tx', call.tx.hash)}>pending</a>
        <Icon name="ExternalLink" />
      </span>
    {:else if call.step === 3}
      <span class="icon-text">
        <Icon name="Check" class="mr-0" />
        <a
          rel="noreferrer"
          target="_blank"
          href={explorer($chainData, 'tx', call.tx.hash)}>success</a>
        <Icon name="ExternalLink" />
      </span>
    {/if}
  </p>
</div>

<style lang="scss">
  @import '../scss/_variables.scss';

  .pending {
    border: 0.5em solid #f3f3f3;
    border-radius: 60%;
    border-top: 0.3em solid $primary;
    border-bottom: 0.3em solid $primary;
    width: 1em;
    height: 1em;
    -webkit-animation: spin 1s linear infinite;
    animation: spin 1s linear infinite;
  }

  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
