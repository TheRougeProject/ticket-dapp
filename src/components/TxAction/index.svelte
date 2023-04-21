<script>
  import { createEventDispatcher, setContext } from 'svelte'
  import { writable } from 'svelte/store'

  import { chainData, provider, signerAddress } from 'ethers-svelte'

  import tracker from '$stores/tracker.js'

  const dispatch = createEventDispatcher()

  /*

     steps shoudl follow a tx from submission to completion or failure

     "completion or failure" => need handler & id for that
     also centralized in common state for history & reload

     similar to notify ..

   */

  export let submitCtx
  export let disabled
  export let autoReset = false

  // export out so possibkle to use state
  export let callId

  let txAction
  let control = {}

  export const reset = () =>
    txAction.update((state) => ({
      ...state,
      callId: null,
      control: {}
    }))

  const submit = async () => {
    const ctx = await submitCtx()
    if (typeof ctx !== 'object') return

    // XXX more controls ?
    // params is not really defined in specs, use options ?
    if (ctx.params && ctx.params.length > 1) {
      const options = ctx.params[ctx.params.length - 1]

      if (typeof options === 'object' && options.value) {
        const balance = await $provider.getBalance($signerAddress)

        if (balance < options.value) {
          txAction.update((state) => ({
            ...state,
            control: {
              err: true,
              errMsg: `Not enough ${$chainData.nativeCurrency.name} in your wallet!`
            }
          }))
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
        if (autoReset) {
          // XXX todo wait for next project update instead of timeout ?
          setTimeout(reset, 1000)
        }
      },
      onError: (err, rcpt = {}) => {
        console.log('[%s] onError', callId, err, rcpt)
        dispatch('error', err, rcpt)
        if (ctx.onError) ctx.onError(err, rcpt)
      }
    })
    txAction.update((state) => ({
      ...state,
      callId
    }))
    console.log('receive callId form tracker', callId)
  }

  txAction = writable({ submit, reset, disabled, callId, control })

  setContext('txAction', txAction)
</script>

<slot />
