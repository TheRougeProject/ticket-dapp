<script>
  import { createPopper } from '@popperjs/core'

  import { setClipboard } from '$lib/utils.js'

  export let text = ''
  export let tootipLabel = 'copied!'

  let show = false

  let next, tooltip

  export const copy = () => {
    createPopper(next.previousElementSibling, tooltip, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 5]
          }
        }
      ]
    })
    setClipboard(text)
    show = true
    setTimeout(() => {
      show = false
    }, 1000)
  }
</script>

<div
  bind:this={tooltip}
  class:xvisible={show}
  class:xhidden={!show}
  class="tooltip"
  id="tooltip"
  role="tooltip">
  {tootipLabel}
  <div id="arrow" data-popper-arrow />
</div>

<slot {copy} /><span class="next" bind:this={next} />

<style lang="scss">
  .xvisible {
    visibility: visible !important;
    opacity: 1 !important;
  }

  .xhidden {
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s 1s, opacity 1s linear;
  }

  .next {
    display: none;
  }

  #tooltip {
    position: absolute;
    background: #333;
    color: white;
    font-weight: bold;
    padding: 4px 8px;
    font-size: 13px;
    border-radius: 4px;
  }

  #arrow,
  #arrow::before {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
  }

  #arrow {
    visibility: hidden;
  }

  #arrow::before {
    visibility: visible;
    content: '';
    transform: rotate(45deg);
  }
</style>
