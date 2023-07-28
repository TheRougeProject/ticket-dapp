<script>
  import { onMount } from 'svelte'

  import Cropper from 'cropperjs'
  import Modal from '$components/Modal.svelte'

  export let active = false
  export let src

  let modal
  let cropper

  const close = () => {}

  const template =
    '<cropper-canvas background>' +
    '<cropper-image></cropper-image>' +
    '<cropper-shade hidden></cropper-shade>' +
    '<cropper-handle action="select" plain></cropper-handle>' +
    '<cropper-selection  movable resizable zoomable>' +
    '<cropper-grid role="grid" bordered covered></cropper-grid>' +
    '<cropper-crosshair centered></cropper-crosshair>' +
    '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
    '<cropper-handle action="n-resize"></cropper-handle>' +
    '<cropper-handle action="e-resize"></cropper-handle>' +
    '<cropper-handle action="s-resize"></cropper-handle>' +
    '<cropper-handle action="w-resize"></cropper-handle>' +
    '<cropper-handle action="ne-resize"></cropper-handle>' +
    '<cropper-handle action="nw-resize"></cropper-handle>' +
    '<cropper-handle action="se-resize"></cropper-handle>' +
    '<cropper-handle action="sw-resize"></cropper-handle>' +
    '</cropper-selection>' +
    '</cropper-canvas>'

  const crop = () => {
    const selection = cropper.getCropperSelections()[0]
    console.log(selection)
  }

  const init = () => {
    const image = new Image()

    image.src = src
    image.alt = 'Picture'

    cropper = new Cropper(image, {
      container: '.cropper-container'
      //     template,
    })

    const selection = cropper.getCropperSelections()[0]
    console.log(selection)

    selection.setAttribute('initial-aspect-ratio', 1.77777777777777)
    selection.setAttribute('aspect-ratio', 1.777777777777)

    console.log(selection, template)

    //    console.log(cropper)
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
    <div class="cropper-control m-2">
      <div class="buttons is-centered has-transparent-background">
        <button class="button" on:click={() => {}}>
          <span class="is-hidden-mobile">Zoom</span> in</button>
        <button class="button" on:click={() => {}}>
          <span class="is-hidden-mobile">Zoom</span> out</button>
        <button class="button is-black" on:click={modal.close}>Cancel</button>
        <button class="button is-primary" on:click={crop}>Crop & Save</button>
      </div>
    </div>
    <div class="cropper-container" />
  </Modal>
{/if}

{#if false && src}
  <div class="cropper-container">
    <cropper-canvas background>
      <cropper-image {src} />
      <cropper-shade hidden />
      <cropper-handle action="select" plain />
      <cropper-selection
        initial-coverage="0.5"
        aspect-ratio="1.77777777"
        initial-aspect-ratio="1.77777777"
        movable
        resizable
        zoomable>
        <cropper-grid role="grid" covered />
        <cropper-crosshair centered />
        <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)" />
        <cropper-handle action="n-resize" />
        <cropper-handle action="e-resize" />
        <cropper-handle action="s-resize" />
        <cropper-handle action="w-resize" />
        <cropper-handle action="ne-resize" />
        <cropper-handle action="nw-resize" />
        <cropper-handle action="se-resize" />
        <cropper-handle action="sw-resize" />
      </cropper-selection>
    </cropper-canvas>
  </div>
{/if}

<!-- eslint-disable -->

<style lang="scss" global>
  cropper-canvas {
    height: 100vh;
    width: 100hw;
  }

  .cropper-control {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
  }
</style>
