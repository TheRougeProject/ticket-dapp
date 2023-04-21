<script>
  import { createEventDispatcher } from 'svelte'

  import { chainData } from 'ethers-svelte'

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
  export let callId

  $: call = $tracker[callId] || {}
</script>

<article class="message is-info">
  <div class="message-header">
    <p>{call.label}</p>
    <button
      class="delete"
      aria-label="delete"
      on:click={() => dispatch('close')} />
  </div>
  <div class="message-body">
    <div class="columns is-multiline">
      <div class="column is-two-thirds">
        <ul class="steps is-narrow is-small is-centered has-content-centered">
          <li class="steps-segment has-gaps" class:is-active={call.step === 1}>
            <span class="steps-marker" />
            <div class="steps-content">
              <p class="heading">Wallet</p>
            </div>
          </li>
          <li class="steps-segment has-gaps" class:is-active={call.step === 2}>
            <span class="steps-marker is-hollow" />
            <div class="steps-content">
              <p class="heading">Tx Pending</p>
            </div>
          </li>
          {#if call.err}
            <li class="steps-segment has-gaps">
              <span class="steps-marker is-danger">
                <Icon name="ThumbDown" />
              </span>
              <div class="steps-content">
                <p class="heading">Failure</p>
              </div>
            </li>
          {:else}
            <li
              class="steps-segment has-gaps"
              class:is-active={call.step === 3}>
              <span class="steps-marker" class:is-hollow={call.step < 2}>
                {#if call.step === 3}
                  <Icon name="Check" />
                {/if}
              </span>
              <div class="steps-content">
                <p class="heading">Result</p>
              </div>
            </li>
          {/if}
        </ul>
      </div>

      <div class="column">
        {#if call.tx}
          <p>{explorer($chainData, 'tx', call.tx.hash)}</p>
          <p>
            <a
              rel="noreferrer"
              target="_blank"
              href={explorer($chainData, 'tx', call.tx.hash)}
              >View on block explorer</a>
          </p>
        {/if}
      </div>
    </div>
  </div>
</article>
