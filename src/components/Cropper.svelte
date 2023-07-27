<script>
  import { onMount } from 'svelte'

  import Cropper from 'cropperjs'

  const init = () => {
    const image = new Image()

    image.src = '/rouge-ticket-black.png'
    image.alt = 'Picture'

    const cropper = new Cropper(image, {
      container: '.cropper-container'
    })

    console.log(cropper)
  }

  onMount(init)
</script>

<div class="cropper-container">XXX</div>
