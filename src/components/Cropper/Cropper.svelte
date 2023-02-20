<script>
  /*

Forked from svelte-easy-crop          1.0.7
https://github.com/ValentinH/svelte-easy-crop

MIT License

Copyright (c) 2018 ricardo.ch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import * as helpers from './helpers.js'
  import { browser } from '$app/environment'

  export let image
  export let crop = { x: 0, y: 0 }
  export let zoom = 1
  export let factor = 1
  export let aspect = 4 / 3
  export let minZoom = 1
  export let maxZoom = 3
  export let cropSize = null
  export let cropShape = 'rect'
  export let showGrid = true
  export let zoomSpeed = 0.1
  export let crossOrigin = null
  export let restrictPosition = true // false //  true

  export const getData = () => {
    return { imgEl }
  }

  let cropperSize = null
  let imageSize = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }
  let containerEl = null
  let containerRect = null
  let imgEl = null
  let dragStartPosition = { x: 0, y: 0 }
  let dragStartCrop = { x: 0, y: 0 }
  let lastPinchDistance = 0
  let rafDragTimeout = null
  let rafZoomTimeout = null

  const dispatch = createEventDispatcher()

  onMount(() => {
    if (!browser) return
    window.addEventListener('resize', computeSizes)
    containerEl.addEventListener('wheel', onWheel, { passive: false })
    containerEl.addEventListener('gesturestart', preventZoomSafari)
    containerEl.addEventListener('gesturechange', preventZoomSafari)

    // when rendered via SSR, the image can already be loaded
    // and its onLoad callback will never be called
    if (imgEl && imgEl.complete) {
      onImgLoad()
    }
  })

  onDestroy(() => {
    if (!browser) return
    window.removeEventListener('resize', computeSizes)
    containerEl.removeEventListener('wheel', onWheel)
    containerEl.removeEventListener('gesturestart', preventZoomSafari)
    containerEl.removeEventListener('gesturechange', preventZoomSafari)
    cleanEvents()
  })

  // this is to prevent Safari on iOS >= 10 to zoom the page
  const preventZoomSafari = (e) => e.preventDefault()

  const cleanEvents = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onDragStopped)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onDragStopped)
  }

  const onImgLoad = () => {
    computeSizes()
    emitCropData()
  }

  const getAspect = () => {
    if (cropSize) {
      return cropSize.width / cropSize.height
    }
    return aspect
  }

  const computeSizes = () => {
    if (imgEl) {
      imageSize = {
        width: imgEl.width,
        height: imgEl.height,
        naturalWidth: imgEl.naturalWidth,
        naturalHeight: imgEl.naturalHeight
      }
      cropperSize = cropSize
        ? cropSize
        : helpers.getCropSize(imgEl.width, imgEl.height, aspect)
    }
    if (containerEl) {
      containerRect = containerEl.getBoundingClientRect()
    }
  }

  const getMousePoint = (e) => ({ x: Number(e.clientX), y: Number(e.clientY) })

  const getTouchPoint = (touch) => ({
    x: Number(touch.clientX),
    y: Number(touch.clientY)
  })

  const onMouseDown = (e) => {
    e.preventDefault()
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onDragStopped)
    onDragStart(getMousePoint(e))
  }

  const onMouseMove = (e) => onDrag(getMousePoint(e))

  const onTouchStart = (e) => {
    e.preventDefault()
    // iOS 11 now defaults to passive: true
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onDragStopped)
    if (e.touches.length === 2) {
      onPinchStart(e)
    } else if (e.touches.length === 1) {
      onDragStart(getTouchPoint(e.touches[0]))
    }
  }

  const onTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 2) {
      onPinchMove(e)
    } else if (e.touches.length === 1) {
      onDrag(getTouchPoint(e.touches[0]))
    }
  }

  const onDragStart = ({ x, y }) => {
    dragStartPosition = { x: x * factor, y: y * factor }
    dragStartCrop = { x: crop.x, y: crop.y }
  }

  const onDrag = ({ x, y }) => {
    if (rafDragTimeout) window.cancelAnimationFrame(rafDragTimeout)

    rafDragTimeout = window.requestAnimationFrame(() => {
      if (x === undefined || y === undefined) return
      const offsetX = x * factor - dragStartPosition.x
      const offsetY = y * factor - dragStartPosition.y
      const requestedPosition = {
        x: dragStartCrop.x + offsetX / factor,
        y: dragStartCrop.y + offsetY / factor
      }

      crop = restrictPosition
        ? helpers.restrictPosition(
            requestedPosition,
            imageSize,
            cropperSize,
            zoom
          )
        : requestedPosition
    })
  }

  const onDragStopped = () => {
    cleanEvents()
    emitCropData()
  }

  const onPinchStart = (e) => {
    const pointA = getTouchPoint(e.touches[0])
    const pointB = getTouchPoint(e.touches[1])
    lastPinchDistance = helpers.getDistanceBetweenPoints(pointA, pointB)
    onDragStart(helpers.getCenter(pointA, pointB))
  }

  const onPinchMove = (e) => {
    const pointA = getTouchPoint(e.touches[0])
    const pointB = getTouchPoint(e.touches[1])
    const center = helpers.getCenter(pointA, pointB)
    onDrag(center)

    if (rafZoomTimeout) window.cancelAnimationFrame(rafZoomTimeout)
    rafZoomTimeout = window.requestAnimationFrame(() => {
      const distance = helpers.getDistanceBetweenPoints(pointA, pointB)
      const newZoom = zoom * (distance / lastPinchDistance)
      setNewZoom(newZoom, center)
      lastPinchDistance = distance
    })
  }

  const onWheel = (e) => {
    e.preventDefault()
    const newZoom = zoom - (e.deltaY * zoomSpeed) / 200
    const point = getMousePoint(e)
    setNewZoom(newZoom, point)
  }

  export const setZoom = (newZoom) => {
    const point = getPointOnImage({ x: 0, y: 0 })
    setNewZoom(newZoom, point)
  }

  const getPointOnContainer = ({ x, y }) => {
    if (!containerRect) {
      throw new Error('The Cropper is not mounted')
    }
    return {
      x: containerRect.width / 2 - (x - containerRect.left),
      y: containerRect.height / 2 - (y - containerRect.top)
    }
  }

  const getPointOnImage = ({ x, y }) => ({
    x: (x + crop.x) / zoom,
    y: (y + crop.y) / zoom
  })

  const setNewZoom = (newZoom, point) => {
    const zoomPoint = getPointOnContainer(point)
    const zoomTarget = getPointOnImage(zoomPoint)

    // dynamic min/max
    minZoom = 1
    maxZoom = imageSize.naturalWidth / cropSize.width

    zoom = Math.min(maxZoom, Math.max(newZoom, minZoom))

    const requestedPosition = {
      x: zoomTarget.x * zoom - zoomPoint.x,
      y: zoomTarget.y * zoom - zoomPoint.y
    }
    crop = restrictPosition
      ? helpers.restrictPosition(
          requestedPosition,
          imageSize,
          cropperSize,
          zoom
        )
      : requestedPosition
  }

  const emitCropData = () => {
    if (!cropperSize || cropperSize.width === 0) return
    // this is to ensure the crop is correctly restricted after a zoom back
    // (https://github.com/ricardo-ch/svelte-easy-crop/issues/6)
    const position = restrictPosition
      ? helpers.restrictPosition(crop, imageSize, cropperSize, zoom)
      : crop
    const { croppedAreaPercentages, croppedAreaPixels } =
      helpers.computeCroppedArea(
        position,
        imageSize,
        cropperSize,
        getAspect(),
        zoom,
        restrictPosition
      )

    // also send via bind ...
    crop = { ...crop, croppedAreaPercentages, croppedAreaPixels }

    dispatch('cropcomplete', {
      percent: croppedAreaPercentages,
      pixels: croppedAreaPixels
    })
  }

  // ------ Reactive statement ------
  //when aspect changes, we reset the cropperSize
  $: if (imgEl) {
    cropperSize = cropSize
      ? cropSize
      : helpers.getCropSize(imgEl.width, imgEl.height, aspect)
  }

  // when zoom changes, we recompute the cropped area
  $: zoom && emitCropData()
</script>

<div
  class="cropper-container"
  bind:this={containerEl}
  on:mousedown={onMouseDown}
  on:touchstart={onTouchStart}
  data-testid="container">
  <img
    id="srcImg"
    bind:this={imgEl}
    class="cropper-image"
    src={image}
    on:load={onImgLoad}
    alt=""
    style="transform: translate({crop.x * factor}px, {crop.y *
      factor}px) scale({zoom * factor});"
    {crossOrigin} />
  {#if cropperSize}
    <div
      class="cropperArea"
      class:round={cropShape === 'round'}
      class:cropper-grid={showGrid}
      style="width: {cropperSize.width *
        factor}px; height: {cropperSize.height * factor}px;"
      data-testid="cropper" />
  {/if}
</div>

<style>
  .cropper-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    user-select: none;
    touch-action: none;
    cursor: move;
  }

  .cropper-image {
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    will-change: transform;
  }

  .cropperArea {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 9999em;
    box-sizing: border-box;
    color: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.7);
    overflow: hidden;
  }

  .cropper-grid:before {
    content: ' ';
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.5);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 33.33%;
    right: 33.33%;
    border-top: 0;
    border-bottom: 0;
  }

  .cropper-grid:after {
    content: ' ';
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.5);
    position: absolute;
    top: 33.33%;
    bottom: 33.33%;
    left: 0;
    right: 0;
    border-left: 0;
    border-right: 0;
  }

  .round {
    border-radius: 50%;
  }
</style>
