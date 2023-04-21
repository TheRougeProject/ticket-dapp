<script>
  import { chainData } from 'ethers-svelte'
  import { Jazzicon } from 'ethers-svelte/components'

  import { keyDownA11y, formatAddress } from '$lib/utils'

  import { explorer } from '$lib/utils.js'

  import Icon from '$components/Icon.svelte'
  import ClipboardCopy from '$components/tools/ClipboardCopy.svelte'

  export let address
  export let copy = true
  export let external = true
</script>

<span class="icon-text">
  <span class="icon"><Jazzicon {address} size={25} /></span>
  <span>{formatAddress(address)}</span>
  {#if copy}
    <ClipboardCopy let:copy text={address} tootipLabel="copied!">
      <a
        href="#copy"
        class="pl-2"
        on:click={copy}
        on:keydown={keyDownA11y(copy)}><Icon name="Copy" /></a>
    </ClipboardCopy>
  {/if}
  {#if external}
    <a
      class="pl-2"
      rel="noreferrer"
      href={explorer($chainData, 'address', address)}
      target="_blank"><Icon name="ExternalLink" /></a>
  {/if}
</span>
