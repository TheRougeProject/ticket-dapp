<script context="module">
  import { portal } from '$lib/actions/portal.js'
</script>

<script>
  export let target = 'body'
</script>

<div use:portal={target} hidden>
  <slot />
</div>
