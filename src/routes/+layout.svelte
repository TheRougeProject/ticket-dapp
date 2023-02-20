<script>
  import blockchain from '$lib/blockchain.js'

  const beforeUnload = () => {
    // Cancel the event as stated by the standard.
    // event.preventDefault()

    // Chrome requires returnValue to be set.
    // event.returnValue = ''
    // more compatibility

    blockchain.off()

    //return '...';
  }
</script>

<svelte:window on:beforeunload={beforeUnload} />
<slot />
