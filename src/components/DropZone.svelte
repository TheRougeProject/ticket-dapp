<script>
  import Dropzone from 'svelte-file-dropzone'

  // export let title = 'Drop files here'
  export let buttonLabel = 'Choose files'
  export let buttonClass = undefined
  export let accept
  export let minSize
  export let maxSize
  export let multiple

  let zone
  const open = () => zone.querySelector('input').click()
</script>

<div bind:this={zone}>
  <Dropzone
    {accept}
    {minSize}
    {maxSize}
    {multiple}
    noClick={true}
    containerClasses="filedrop has-background-white has-text-primary"
    on:drop
    on:dragenter
    on:dragover
    on:dragleave
    on:droprejected
    on:dropaccepted>
    <slot />
    <button class="button {buttonClass}" outlined on:click={open}
      >{buttonLabel}</button>
  </Dropzone>
</div>

<style>
</style>
