<script>
  import '../../scss/app.scss'

  import { onDestroy, onMount } from 'svelte'

  import { connected, signerAddress, chainData } from 'ethers-svelte'

  import { Jazzicon } from 'ethers-svelte/components'

  import Head from '$components/Head.svelte'
  import AppContext from '$components/AppContext.svelte'
  import AppMenuPopover from '$components/design/AppMenuPopover.svelte'

  import { dev } from '$app/environment'
  import { keyDownA11y, formatAddress, isChoosing } from '$lib/utils'

  import Icon from '$components/Icon.svelte'
  import blockchain from '$lib/blockchain.js'
  import ThemeSwitch from '../../components/tools/ThemeSwitch.svelte'
  import WalletChoiceModal from '../../components/WalletChoiceModal.svelte'
  import wallet from '$lib/wallet'
  import { createMagicSigner } from '$lib/eoa-signer'

  let signer

  // using this because the sdk ui takes a little while to load
  let loading = false

  async function handleChoice(choice) {
    if (choice === 'eoa') {
      loading = true
      try {
        signer = await createMagicSigner()

        // log to console to signer to see
      } finally {
        loading = false
      }
    } else if (choice === 'existing') {
      blockchain.connect()
    }
  }

  onMount(async () => {
    if (!$signerAddress) blockchain.autoConnect()
  })

  let unsubscribeChoosing = isChoosing.subscribe((v) => v)

  onDestroy(() => {
    unsubscribeChoosing()
  })

  let popparent
</script>

<Head />

<AppContext>
  <nav class="navbar is-transparent" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item is-black" alt="Rouge Ticket" href="/">
        <span class="mx-2 is-hidden-mobile"
          ><img alt="Rouge Ticket logo" src="/rouge-ticket-white.svg" /></span
        >
        <span class="mx-2 icon is-large is-hidden-tablet"
          ><img alt="Rouge Ticket logo" src="/logo.svg" /></span
        >
      </a>
    </div>

    {#if $connected}
      <div
        bind:this={popparent}
        class="navbar-brand is-justify-content-center is-hidden-tablet"
      >
        <AppMenuPopover let:toggle {popparent}>
          <a
            href="#apps"
            class="navbar-item"
            on:click={toggle}
            on:keydown={keyDownA11y(toggle)}
          >
            <Icon name="GridDots" />
          </a>
        </AppMenuPopover>
      </div>
    {/if}

    <div class="navbar-brand is-justify-content-flex-end">
      {#if $connected}
        <div class="navbar-item pr-0">
          <span class="icon-text">
            <span class="icon"
              ><Jazzicon address={$signerAddress} size={24} /></span
            >
            <small class="is-hidden-mobile"
              >{formatAddress($signerAddress)}</small
            >
          </span>
        </div>
        <div class="navbar-item">
          <span class="tag is-white is-hidden-touch">{$chainData.name}</span>
          <span class="tag is-white is-hidden-desktop"
            >{$chainData.shortName}</span
          >
        </div>
        <a
          href="#disconnect"
          class="navbar-item is-hidden-mobile"
          on:click={() => blockchain.disconnect()}
          on:keydown={keyDownA11y(() => blockchain.disconnect())}
        >
          <Icon name="Logout" class="mr-1" />
        </a>
      {:else}
        <div class="navbar-item">
          <button
            class="button is-white is-inverted is-responsive"
            on:click={() => isChoosing.set(true)}
          >
            Connect<span class="is-hidden-mobile ml-2"> Wallet</span>
          </button>
        </div>
      {/if}
      <div class="navbar-item">
        <ThemeSwitch isTrue={false} />
      </div>
    </div>

    <!--
         <a class="navbar-item">
         Report an issue
         </a>
    -->
  </nav>

  <main>
    <div class="container is-fullhd">
      <div class="container is-fluid">
        <slot />
      </div>
    </div>
  </main>

  {#if loading}
    <div class="content">
      <iconify-icon
        icon="eos-icons:bubble-loading"
        style="color: #900;"
        width="50"
      ></iconify-icon>
    </div>
  {/if}

  <WalletChoiceModal
    isOpen={$isChoosing}
    on:choice={async (e) => await handleChoice(e.detail)}
  />

  <div id="turnkey-iframe-container" />
  <div class="footer">
    <div class="container is-max-desktop">
      <nav class="flex is-flex-wrap-wrap is-justify-content-center is-size-7">
        <div class="xis-flex-grow-1 has-text-centered">
          <span class="icon-text">
            <a rel="noreferrer" target="_blank" href="https://rouge.network/"
              ><span class="icon">
                <img alt="Rouge Project logo" src="/rouge.svg" />
              </span></a
            >&nbsp;
            <a rel="noreferrer" target="_blank" href="https://rouge.network/"
              >The Rouge Project</a
            >&nbsp;
          </span>
        </div>
        <div class="xis-flex-grow-1 has-text-centered">
          <span class="icon-text">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://discord.gg/aUeSjsN8Tx"
              ><Icon name="BrandDiscord" /></a
            >&nbsp;
            <a
              rel="noreferrer"
              target="_blank"
              href="https://discord.gg/aUeSjsN8Tx">Discord</a
            >
          </span>
        </div>
        <div class="xis-flex-grow-1 has-text-centered">
          <span class="icon-text">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://github.com/TheRougeProject"
              ><Icon name="BrandGithub" /></a
            >&nbsp;
            <a
              rel="noreferrer"
              target="_blank"
              href="https://github.com/TheRougeProject">GitHub</a
            >
          </span>
        </div>
        {#if dev}
          <div class="xis-flex-grow-1 has-text-centered">
            <span class="icon-text">
              <a href="/test/">test</a>
            </span>
          </div>
          <div class="xis-flex-grow-1 has-text-centered">
            <span class="icon-text">
              <a rel="noreferrer" target="_blank" href="/theme/">Theme</a>
            </span>
          </div>
          <div class="xis-flex-grow-1 has-text-centered">
            <span class="icon-text">
              <a rel="noreferrer" target="_blank" href="/i/scan/"
                >Ticket check</a
              >
            </span>
          </div>
        {/if}
      </nav>
    </div>
  </div>
</AppContext>

<style lang="scss">
  @use '../../scss/main.scss' as m;
  @use 'bulma/sass/utilities/mixins';

  nav.navbar,
  main,
  .footer {
    background-color: m.$brand;
  }

  main {
    min-height: calc(100vh - 5rem);
  }

  .container.is-fluid {
    @include mixins.mobile {
      padding-left: 0;
      padding-right: 0;
    }
  }

  nav {
    display: flex;
    align-items: stretch;

    color: #fff;
    a {
      color: #fff;
    }

    .navbar-brand {
      flex: 1;
      align-items: stretch;

      .navbar-item {
        padding-top: 0;
        padding-bottom: 0;
        padding-left: 0;
        padding-right: 0;
        color: #fff;
        strong {
          color: #fff;
        }
      }

      &.is-justify-content-flex-end {
        margin-right: -0.25rem;

        .navbar-item {
          margin-right: 0.75em;
        }
        // same as logo
      }
    }

    .navbar-item .is-large img {
      max-height: none;
    }
  }

  .footer {
    background-color: m.$brand;
    color: #fff;

    nav > div {
      margin-bottom: 3rem;
      width: 150px;
    }

    a {
      color: #fff;
    }
  }
</style>
