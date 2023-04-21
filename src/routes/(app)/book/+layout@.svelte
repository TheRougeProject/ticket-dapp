<script>
  import { connected, signerAddress, chainData } from 'ethers-svelte'

  import { Jazzicon } from 'ethers-svelte/components'

  import { keyDownA11y, formatAddress } from '$lib/utils'
  import blockchain from '$lib/blockchain.js'

  import AppContext from '$components/AppContext.svelte'
  import Icon from '$components/Icon.svelte'
  import AppMenuPopover from '$components/design/AppMenuPopover.svelte'
  import BreadcrumbNav from '../BreadcrumbNav.svelte'

  let popparent
</script>

<AppContext>
  <nav class="navbar" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item is-black" alt="Rouge Ticket" href="/book">
        <span class="mx-2 is-hidden-mobile"
          ><img alt="Rouge Ticket logo" src="/rouge-ticket-black.svg" /></span>
        <span class="mx-2 icon is-large is-hidden-tablet"
          ><img alt="Rouge Ticket logo" src="/logo.svg" /></span>
      </a>
    </div>

    {#if $connected}
      <div
        bind:this={popparent}
        class="navbar-brand is-justify-content-center is-hidden-tablet">
        <AppMenuPopover let:toggle {popparent}>
          <a
            href="#apps"
            class="navbar-item"
            on:click={toggle}
            on:keydown={keyDownA11y(toggle)}>
            <Icon name="GridDots" />
          </a>
        </AppMenuPopover>
      </div>
    {/if}

    <div class="navbar-brand is-justify-content-flex-end">
      {#if $signerAddress}
        <div class="navbar-item pr-0">
          <span class="icon-text">
            <span class="icon"
              ><Jazzicon address={$signerAddress} size={24} /></span>
            <small class="is-hidden-mobile"
              >{formatAddress($signerAddress)}</small>
          </span>
        </div>
        <div class="navbar-item">
          <span class="tag is-hidden-touch">{$chainData.name}</span>
          <span class="tag is-hidden-desktop">{$chainData.shortName}</span>
        </div>
        <a
          href="#disconnect"
          class="navbar-item is-hidden-mobile"
          on:click={() => blockchain.disconnect()}
          on:keydown={keyDownA11y(() => blockchain.disconnect())}>
          <Icon name="Logout" class="" />
        </a>
      {:else}
        <div class="navbar-item">
          <button
            class="button is-white is-inverted is-responsive"
            on:click={() => blockchain.connect()}>
            Connect Wallet
          </button>
        </div>
      {/if}
    </div>
  </nav>

  <div class="container is-max-desktop">
    <div class="container is-fluid">
      <BreadcrumbNav class="mt-5 mb-2" />

      <div class="box">
        <slot />
      </div>
    </div>
  </div>
</AppContext>

<style lang="scss">
  @import '../../../scss/_variables.scss';
  @import 'bulma/sass/utilities/_all';

  :global(body) {
    background-color: $grey-standalone;
  }

  :global(.version a) {
    color: #888 !important;
  }

  .container.is-max-desktop {
    @include mobile {
      padding-top: 3.5rem;
    }
    @include tablet {
      padding: 4rem;
    }
  }

  .navbar {
    background-color: $grey-standalone;
  }

  nav {
    display: flex;
    align-items: stretch;
    background-color: transparent;

    .navbar-brand {
      flex: 1;
      justify-content: left;

      &:last-child {
        justify-content: right;
      }

      a:hover {
        color: currentColor;
      }
    }
  }

  .navbar-item .is-large img {
    max-height: none;
  }
</style>
