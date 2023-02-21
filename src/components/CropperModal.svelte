<script>
  import Modal from '$components/Modal.svelte'
  import Cropper from '$components/Cropper/Cropper.svelte'

  export let active = false
  export let title
  export let image
  export let handler
  export let minWidth
  export let minHeight
  export let factor = 1

  let crop
  let cropSize
  let zoom

  export const reset = () => {
    crop = { x: 0, y: 0 }
    cropSize = { width: minWidth, height: minHeight }
    zoom = 1
  }

  reset()

  const doCrop = async () => {
    const tmpCanvas = document.createElement('canvas')
    tmpCanvas.width = cropSize.width
    tmpCanvas.height = cropSize.height

    const ctx = tmpCanvas.getContext('2d')

    // TODO XXX just export el from cropper ?
    const { imgEl } = cropper.getData()
    // console.log('before crop', crop)
    const { x, y, width, height } = crop.croppedAreaPixels

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    console.log({ x, y, width, height, safeArea })

    ctx.drawImage(
      imgEl,
      x,
      y,
      width,
      height,
      0,
      0,
      cropSize.width,
      cropSize.height
    )

    handler(tmpCanvas.toDataURL('image/png'))

    modal.close()
  }

  let width
  let height

  const onComplete = (e) => {
    // only log in this version
    void ({
      pixels: { width, height }
    } = e.detail)
    //console.log('on complete', e, e.detail, crop, cropSize, zoom)
  }

  let modal
  let cropper
</script>

<Modal bind:this={modal} bind:active noCloseButton={true}>
  <div class="modal-card m-0">
    <header class="modal-card-head  has-background-light">
      <p class="modal-card-title">{title}</p>
      <p style="color: #f00;" />
      <button class="delete" aria-label="close" on:click={modal.close} />
    </header>
    <section
      class="modal-card-body  has-background-light"
      style="position: relative; min-height: 432px;">
      {#if true}
        <Cropper
          {image}
          bind:this={cropper}
          bind:crop
          bind:cropSize
          bind:factor
          bind:zoom
          on:cropcomplete={onComplete} />
      {/if}
    </section>
    <footer class="modal-card-foot">
      <p class="card-footer-item is-hidden-mobile">
        <em>selection = {width}x{height}</em>
      </p>
      <button
        class="button"
        on:click={() => {
          cropper.setZoom(zoom * 1.1)
        }}><span class="is-hidden-mobile">Zoom</span> in</button>
      <button
        class="button"
        on:click={() => {
          cropper.setZoom(zoom * 0.9)
        }}><span class="is-hidden-mobile">Zoom</span> out</button>
      <button class="button is-black" on:click={modal.close}>Cancel</button>
      <button class="button is-primary" on:click={doCrop}>Crop & Save</button>
    </footer>
  </div>
</Modal>
