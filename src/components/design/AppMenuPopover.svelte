<script>
  import { createPopper } from '@popperjs/core'
  import { page } from '$app/stores'

  import { clickoutside } from '$lib/actions/clickoutside.js'
  import { keyDownA11y } from '$lib/utils'

  import chainContext from '$stores/chain.js'
  import blockchain from '$lib/blockchain.js'

  import Icon from '$components/Icon.svelte'

  let popover

  let target

  export let popper
  export let popparent

  export const outside = ({ detail: origin }) => {
    if (popover.classList.contains('is-hidden')) return
    if (origin.target == target) return
    popover.classList.add('is-hidden')
  }

  export const toggle = (e) => {
    if (!popover.classList.contains('is-hidden')) {
      popover.classList.add('is-hidden')
      return
    }

    popper = createPopper(popparent, popover, {
      placement: 'bottom',
      modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
    })

    popover.classList.remove('is-hidden')
    target = e.target
  }
</script>

<slot {toggle} />

<div bind:this={popover} class="popover is-hidden">
  <div class="arrow" data-popper-arrow />
  <aside
    class="box has-background-primary"
    use:clickoutside
    on:clickoutside={outside}>
    <ul class="menu-list">
      <li class="mb-4">
        <span class="mx-2"
          ><img
            style="height: 2em;"
            alt="Rouge Ticket logo"
            src="/rouge-ticket-white.svg" /></span>
      </li>
      <li>
        <a
          on:click={toggle}
          href="/"
          class:is-active={!/^(\/journey|\/book)/.test($page.url.pathname)}>
          <span class="icon-text is-small"
            ><Icon name="List" class="mr-2" /><span>Event Manager</span></span>
        </a>
      </li>
      <li>
        <a
          on:click={toggle}
          href="/book"
          class:is-active={/^\/book/.test($page.url.pathname)}>
          <span class="icon-text"
            ><Icon name="Book" class="mr-2" /><span>Tickets book</span></span>
        </a>
      </li>
      {#if $chainContext.plugins.includes('journey')}
        <li>
          <a
            on:click={toggle}
            href="/journey"
            class:is-active={/^\/journey/.test($page.url.pathname)}>
            <span class="icon-text"
              ><Icon name="Award" class="mr-2" /><span>Rouge Journey</span
              ></span>
          </a>
        </li>
      {/if}
      <li>
        <a
          href="#disconnect"
          on:click={blockchain.disconnect}
          on:keydown={keyDownA11y(blockchain.disconnect)}>
          <span class="icon-text"
            ><Icon name="Logout" class="mr-2" /><span>Disconnect</span></span>
        </a>
      </li>
    </ul>
  </aside>
</div>

<style lang="scss">
  @import '../../scss/_variables.scss';
  @import 'bulma/sass/utilities/_all';

  a {
    color: $white;
  }

  .arrow,
  .arrow::before {
    position: absolute;
    width: 1em;
    height: 1em;
    background: $primary;
  }

  .arrow {
    visibility: hidden;
  }

  .arrow::before {
    visibility: visible;
    content: '';
    transform: rotate(45deg);
  }

  :global(.popover[data-popper-placement^='top']) > .arrow {
    bottom: -0.5em;
  }

  :global(.popover[data-popper-placement^='bottom']) > .arrow {
    top: -0.5em;
  }

  :global(.popover[data-popper-placement^='left']) > .arrow {
    right: -0.5em;
  }

  :global(.popover[data-popper-placement^='right']) > .arrow {
    left: -0.5em;
  }
</style>
