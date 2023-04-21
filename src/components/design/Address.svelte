<script>
  import { chainData as chainDataStore } from 'ethers-svelte'
  import { Identicon } from 'ethers-svelte/components'

  import { formatAddress } from '$lib/utils'

  import { explorer } from '$lib/utils.js'

  import Icon from '$components/Icon.svelte'

  export let address
  export let noIdenticon = false
  export let label
  export let chainData

  const slots = $$props.$$slots
</script>

<a
  rel="noreferrer"
  href={explorer(chainData || $chainDataStore, 'address', address)}
  target="_blank">
  {#if slots && Object.prototype.hasOwnProperty.call(slots, 'default')}
    <slot />
  {:else if label}
    {label}
  {:else}
    <span class="icon-text">
      {#if !noIdenticon}<span class="icon"><Identicon {address} /></span>{/if}
      <span>{formatAddress(address)}</span><Icon name="ExternalLink" />
    </span>
  {/if}
</a>
