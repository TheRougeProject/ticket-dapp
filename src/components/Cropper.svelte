<script>
  import { onMount } from 'svelte'

  import Cropper from 'cropperjs'
  import Modal from '$components/Modal.svelte'

  export let active = false
  export let src

  let modal

  const close = () => {}

  const init = () => {
    const image = new Image()

    image.src = src
    // image.alt = 'Picture'

    const cropper = new Cropper(image, {
      container: '.cropper-container'
    })

    console.log(cropper)
  }

  onMount(init)
</script>

{#if active}
  <Modal
    bind:this={modal}
    bind:active
    class="fullscreen"
    noCloseButton={true}
    on:close={close}>
    <div class="cropper-container" />
  </Modal>
{/if}

<!-- eslint-disable -->

<style lang="scss" global>
  cropper-canvas {
    height: 100vh;
    width: 100hw;
  }
</style>
