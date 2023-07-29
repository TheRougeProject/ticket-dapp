<script>
  import { onMount } from 'svelte'

  import Cropper from 'cropperjs'
  import Modal from '$components/Modal.svelte'

  export let active = false
  export let src

  let modal
  let cropper
  let selection
  let info

  const close = () => {}

  const crop = async () => {
    console.log(selection)

    const canvas = await selection.$toCanvas()
    console.log(canvas)
  }

  const updateInfo = () => {
    const [scaleX, , , scaleY] = cropper.getCropperImage().$getTransform()
    info = {
      width: Math.round(selection.width / scaleX),
      height: Math.round(selection.height / scaleY)
    }
    // minWidth={768}
    // minHeight={432}
  }

  const init = () => {
    const image = new Image()

    image.src = src
    image.alt = 'Picture'

    cropper = new Cropper(image, {
      container: '.cropper-container'
    })

    // but not if image small than window
    cropper
      .getCropperImage()
      .$center('contain')
      .addEventListener('transform', updateInfo)

    selection = cropper.getCropperSelections()[0]

    selection.setAttribute('initial-aspect-ratio', 1.77777777777777)
    selection.setAttribute('aspect-ratio', 1.777777777777)
    selection.$moveTo(selection.x + 1)
    selection.$center()

    selection.addEventListener('change', updateInfo)
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
    <div class="cropper-info m-2">
      <div class="has-text-centered has-transparent-background">
        <span>{info?.width} x {info?.height}</span>
      </div>
    </div>
    <div class="cropper-control m-2">
      <div class="buttons is-centered has-transparent-background">
        <button
          class="button"
          on:click={() => {
            cropper.getCropperImage().$zoom(0.05)
          }}>
          <span class="is-hidden-mobile mr-1">Zoom</span> In</button>
        <button
          class="button"
          on:click={() => {
            cropper.getCropperImage().$zoom(-0.05)
          }}>
          <span class="is-hidden-mobile mr-1">Zoom</span> Out</button>
        <button class="button is-black" on:click={modal.close}>Cancel</button>
        <button class="button is-primary" on:click={crop}>Crop & Save</button>
      </div>
    </div>
    <div class="cropper-container" />
  </Modal>
{/if}

<!-- eslint-disable -->

<style lang="scss" global>
  cropper-canvas {
    height: 100vh;
    width: 100hw;
  }

  .cropper-info {
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    z-index: 100;
  }

  .cropper-control {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
  }
</style>
