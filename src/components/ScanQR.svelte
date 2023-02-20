<script>
  import { createEventDispatcher } from 'svelte'

  import { onMount } from 'svelte'
  import jsQR from 'jsqr'

  import { browser } from '$app/environment'

  export let recording = false
  export let visible = true

  let video = {}
  let canvas
  let feedback

  const dispatch = createEventDispatcher()

  function drawLine(ctx, begin, end, color) {
    ctx.beginPath()
    ctx.moveTo(begin.x, begin.y)
    ctx.lineTo(end.x, end.y)
    ctx.lineWidth = 4
    ctx.strokeStyle = color
    ctx.stroke()
  }

  const tick = () => {
    feedback.innerText = '⌛ Loading video...'
    const ctx = canvas.getContext('2d')
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      feedback.hidden = true
      const ratio = video.videoWidth / video.videoHeight
      // console.log({ ratio, x: canvas.width })
      canvas.hidden = false
      canvas.height = canvas.width / ratio
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      })
      if (code) {
        drawLine(
          ctx,
          code.location.topLeftCorner,
          code.location.topRightCorner,
          '#FF3B58'
        )
        drawLine(
          ctx,
          code.location.topRightCorner,
          code.location.bottomRightCorner,
          '#FF3B58'
        )
        drawLine(
          ctx,
          code.location.bottomRightCorner,
          code.location.bottomLeftCorner,
          '#FF3B58'
        )
        drawLine(
          ctx,
          code.location.bottomLeftCorner,
          code.location.topLeftCorner,
          '#FF3B58'
        )

        stream.getVideoTracks()[0].stop()
        //stream.removeTrack()
        recording = false

        dispatch('qr', code)
      }
    }
    if (recording) requestAnimationFrame(tick)
  }

  const capture = () => {
    //error = ">🎥 Unable to access video stream (please make sure you have a webcam enabled"

    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        video.srcObject = s
        // required to tell iOS safari we don't want fullscreen
        video.setAttribute('playsinline', true)
        video.play()
        requestAnimationFrame(tick)
      })
  }

  export const start = () => {
    recording = true
    capture()
  }

  export const stop = () => {
    const stream = video.srcObject
    stream.getVideoTracks()[0].stop()
    stream.removeTrack(stream.getVideoTracks()[0])
    recording = false
  }

  onMount(() => {
    // https://www.tutorialspoint.com/webrtc/webrtc_media_stream_apis.htm
    if (browser && recording) start()
  })

  $: stream = video.srcObject || {}
</script>

<div class="scan" class:box={visible} class:is-visible={visible}>
  <video muted bind:this={video} hidden />
  <figure class="image has-ratio">
    <canvas bind:this={canvas} />
  </figure>
  <div class="is-size-7" bind:this={feedback}>
    🎥 Turn on your camera to start scanning QR codes
  </div>
  {#if false}
    <p>recording = {recording} streamActive = {stream.active}</p>
  {/if}
</div>

<style lang="scss">
  .scan {
    visibility: hidden;
    height: 0;

    &.is-visible {
      max-width: 500px;
      margin: auto;
      visibility: visible;
      height: auto;

      figure {
        max-width: 100%;

        canvas {
          width: 100%;
          height: 300px;
          background: #000;
        }
      }
    }
  }
</style>
