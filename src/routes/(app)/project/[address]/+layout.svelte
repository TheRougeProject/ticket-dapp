<script>
  import { onMount, onDestroy } from 'svelte'
  import { connected, chainId, chainData } from 'ethers-svelte'

  import { page } from '$app/stores'

  import { formatAddress } from '$lib/utils'
  import { keyDownA11y, explorer } from '$lib/utils.js'

  import project from '$stores/project.js'

  import Icon from '$components/Icon.svelte'
  import { Identicon } from 'ethers-svelte/components'
  import ClipboardCopy from '$components/tools/ClipboardCopy.svelte'
  import Modal from '$components/Modal.svelte'
  import QR from '$components/QR.svelte'

  export let data

  $: ({ address } = data)

  let collapse = false
  let open = false

  let reduce = (url) => {
    //    const p =
    return url.pathname.replace(/^\/project\/0x[0-9a-fA-F]+\/?/, '/')
  }

  $: position = reduce($page.url)
  $: p = $project[address] || {}

  const unsub = chainId.subscribe(($chainId) => {
    if (
      $project[address] &&
      !$project[address]._isDraft &&
      $project[address]._chainId !== $chainId
    ) {
      console.log(
        'Wrong chain, moving back to home',
        $project[address],
        $chainId
      )
      //goto('/')
    }
  })

  onMount(() => {
    //if (!$connected) goto('/')
  })
  onDestroy(unsub)

  let innerWidth

  $: mobile = innerWidth < 769

  $: collapsed = collapse && !mobile
  $: activated = open || !mobile

  const close = () => {
    open = false
  }

  let modal
  let qrActive = false
  let helpActive = false

  let labels = {
    '/': 'Dashboard',
    '/draft': 'Edit draft',
    '/state': 'State',
    '/holdings': 'Holdings',
    '/settings': 'Settings',
    '/acquisitions': 'Users',
    '/redemptions': 'History',
    '/add-channel': 'Add Channel',
    '/channels': 'Channels'
  }
</script>

<svelte:window bind:innerWidth />

<Modal
  bind:this={modal}
  bind:active={qrActive}
  noCloseButton={true}
  bottomIsRounded={true}>
  <div class="modal-card">
    <header class="modal-card-head has-background-light">
      <p class="modal-card-title">Event Id QR code</p>
      <button class="delete" aria-label="close" on:click={modal.close} />
    </header>
    <section
      class="modal-card-body"
      style="position: relative; min-height: 432px;">
      <article class="message is-info">
        <div class="message-body">
          Share this event id QR code, to add this event on another browser or
          device...
        </div>
      </article>
      <p class="has-text-centered"><small>{p.name}</small></p>
      <QR text={`${$chainData.shortName}:${address}`} />
      <p class="has-text-centered is-size-7">
        <a
          class="icon-text"
          target="_blank"
          rel="noreferrer"
          href={p._isDraft ? '#' : explorer($chainData, 'address', address)}>
          <span><b>{$chainData.shortName}:</b>{address}</span>
          <Icon name="ExternalLink" class="mr-3" />
        </a>
      </p>
    </section>
  </div>
</Modal>

<Modal
  bind:active={helpActive}
  on:close={() => {
    helpActive = false
  }}
  bottomIsRounded={true}>
  <div class="p-6">
    <article class="message is-info">
      <div class="message-body">
        <p class="m-4">
          An event Id is a unique identifier for you event over all chains. It
          is composed of the chain short name (<b>{$chainData.shortName}</b> for
          the current event) and the contract address (<b
            >{mobile ? formatAddress(address) : address}</b> for the current event)
          separated by a colon punctuation mark.
        </p>
        <p class="m-4">
          You can copy/paste your event Id or alternatively use its QR code to
          add your event on any other browser or device.
        </p>
      </div>
    </article>
  </div>
</Modal>

{#if $connected}
  {#if mobile}
    <button
      class="navbar-burger"
      class:is-active={open}
      aria-label="menu"
      aria-expanded="false"
      data-target="projectMenu"
      on:click={() => {
        if (mobile) {
          open = !open
        }
      }}>
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
    {#if open}
      <div class="is-overlay" />
    {/if}
  {/if}

  {#if mobile}
    <div class="level has-background-white mb-0 pb-5">
      <div class="level-left">
        <div class="level-item">
          <h2 class="title is-size-4 mt-5">
            {#if !/^\/$/.test(position)}
              <a href="/project/{address}/">{p.name}</a>
            {:else}
              &nbsp;
            {/if}
          </h2>
        </div>
      </div>
    </div>
  {:else if !mobile}
    <div class="level mb-0">
      <div class="level-left">
        <div class="level-item">
          <div
            class="breadcrumb has-succeeds-separator my-0"
            aria-label="breadcrumbs">
            <ul>
              <li><a href="/">Event manager</a></li>
              <li class="is-active">
                <a href="/project" aria-disabled="true" aria-current="page"
                  >{p.name}</a>
              </li>
              {#if false && labels[position]}
                <li class="is-active">
                  <a href="#position" aria-disabled="true" aria-current="page"
                    >{labels[position]}</a>
                </li>
              {/if}
            </ul>
          </div>
        </div>
      </div>
      <div class="level-left">
        <div class="level-item" />
      </div>
    </div>
  {/if}

  <div class:columns={!mobile}>
    {#if activated}
      <div
        class:column={!mobile}
        class:is-narrow={collapse}
        class:is-3or4={!collapse}>
        <aside
          id="projectMenu"
          class="menu box has-background-white"
          class:is-mobile={mobile}
          class:is-active={activated}
          class:collapsed>
          {#if !collapse}
            <div class="menu-label">
              {#if p._isDraft}Draft mode{:else}Event Id{/if}
            </div>
          {:else}
            <div class="menu-label is-flex is-flex-direction-row-reverse">
              <hr class="is-flex-grow-5" />
            </div>
          {/if}

          <div class="level menu-head is-mobile" class:mt-3={mobile}>
            <div class="level-left">
              <div class="level-item">
                <span class="icon is-large is-rounded">
                  {#if p._isDraft}
                    <img alt="draft placeholder grid" src="/grid.png" />
                  {:else}
                    <a
                      href="#identicon"
                      on:keydown={keyDownA11y(() => {
                        qrActive = !qrActive
                      })}
                      on:click={() => {
                        qrActive = !qrActive
                      }}><Identicon {address} /></a>
                  {/if}
                </span>
              </div>
              {#if !collapse}
                <div class="level-item flex is-flex-direction-column actions">
                  {#if !p._isDraft}
                    <p class="mb-1" style="vertical-align: top;">
                      <small
                        ><b>{$chainData.shortName}:</b>{formatAddress(
                          address
                        )}</small>
                    </p>

                    <p style="vertical-align: bottom;">
                      <a
                        href="#qrcode"
                        on:keydown={keyDownA11y(() => {
                          qrActive = !qrActive
                        })}
                        on:click={() => {
                          qrActive = !qrActive
                        }}><Icon name="qrcode" class="is-small" /></a>
                      <ClipboardCopy
                        let:copy
                        text={`${$chainData.shortName}:${address}`}
                        tootipLabel="copied!">
                        <a
                          href="#copy"
                          on:keydown={keyDownA11y(copy)}
                          on:click={copy}
                          ><Icon name="Copy" class="is-small" /></a>
                      </ClipboardCopy>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={p._isDraft
                          ? '#'
                          : explorer($chainData, 'address', address)}
                        ><Icon name="ExternalLink" class="is-small" /></a>
                      <a
                        href="#info"
                        on:keydown={keyDownA11y(() => {
                          qrActive = !qrActive
                        })}
                        on:click={() => {
                          helpActive = !helpActive
                        }}><Icon name="InfoCircle" class="is-small" /></a>
                    </p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          <div class="menu-label is-flex is-flex-direction-row-reverse">
            <hr class="is-flex-grow-5" />
            {#if !collapse}General{/if}
          </div>
          <ul class="menu-list">
            {#if p._isDraft}
              <li>
                <a
                  on:click={close}
                  class:is-active={/^\/draft/.test(position)}
                  href="/project/{address}/draft">
                  <span class="icon-text"
                    ><Icon name="Edit" class="mr-3" />{#if !collapse}<span
                        >Edit draft</span
                      >{/if}</span>
                </a>
              </li>
            {/if}
            <li>
              <a
                on:click={close}
                class:is-active={/^\/$/.test(position)}
                href="/project/{address}/">
                <span class="icon-text"
                  ><Icon name="dashboard" class="mr-3" />{#if !collapse}<span
                      >Dashboard</span
                    >{/if}</span>
              </a>
            </li>
            <li>
              <a
                on:click={close}
                href="/i/ticket/{$chainData.shortName}:{address}/">
                <span class="icon-text"
                  ><Icon name="ticket" class="mr-3" />{#if !collapse}<span
                      >Get tickets{#if p._isDraft}&nbsp;preview{/if}</span
                    >{/if}</span>
              </a>
            </li>
            {#if !p._isDraft}
              <li>
                <a
                  on:click={close}
                  class:is-active={/^\/state/.test(position)}
                  href="/project/{address}/state">
                  <span class="icon-text"
                    ><Icon name="state" class="mr-3" />{#if !collapse}<span
                        >State</span
                      >{/if}</span
                  ></a>
              </li>
              <li>
                <a
                  on:click={close}
                  class:is-active={/^\/holdings/.test(position)}
                  href="/project/{address}/holdings"
                  ><span class="icon-text"
                    ><Icon name="holdings" class="mr-3" />{#if !collapse}<span
                        >Holdings</span
                      >{/if}</span
                  ></a>
              </li>
              <li>
                <a
                  on:click={close}
                  class:is-active={/^\/settings/.test(position)}
                  href="/project/{address}/settings"
                  ><span class="icon-text"
                    ><Icon name="settings" class="mr-3" />{#if !collapse}<span
                        >Settings</span
                      >{/if}</span
                  ></a>
              </li>
            {/if}
          </ul>

          {#if !p._isDraft}
            <div class="menu-label is-flex is-flex-direction-row-reverse">
              <hr class="is-flex-grow-5" />
              {#if !collapse}Attendees{/if}
            </div>
            <ul class="menu-list">
              <li>
                <a
                  on:click={close}
                  class:is-active={/^\/acquisitions/.test(position)}
                  href="/project/{address}/acquisitions"
                  ><span class="icon-text"
                    ><Icon name="users" class="mr-3" />{#if !collapse}<span
                        >List</span
                      >{/if}</span
                  ></a>
              </li>
            </ul>

            <div class="menu-label is-flex is-flex-direction-row-reverse">
              <hr class="is-flex-grow-5" />
              {#if !collapse}Check-in{/if}
            </div>
            <ul class="menu-list">
              <li>
                <a
                  on:click={close}
                  class:is-active={/^\/scan/.test(position)}
                  href="/project/{address}/scan"
                  ><span class="icon-text"
                    ><Icon name="scanQr" class="mr-3" />{#if !collapse}<span
                        >Scanner</span
                      >{/if}</span
                  ></a>
              </li>
              <li>
                <a
                  on:click={close}
                  class:is-active={/^\/redemptions/.test(position)}
                  href="/project/{address}/redemptions"
                  ><span class="icon-text"
                    ><Icon name="history" class="mr-3" />{#if !collapse}<span
                        >History</span
                      >{/if}</span
                  ></a>
              </li>
            </ul>
          {/if}

          <div class="menu-label is-flex is-flex-direction-row-reverse">
            <hr class="is-flex-grow-5" />
            {#if !collapse}Channels{/if}
          </div>
          <ul class="menu-list">
            <li>
              <a
                on:click={close}
                class:is-active={/^\/channels/.test(position)}
                href="/project/{address}/channels"
                ><span class="icon-text"
                  ><Icon name="details" class="mr-3" />{#if !collapse}<span
                      >Details</span
                    >{/if}</span
                ></a>
            </li>
            <li>
              <a
                on:click={close}
                class:is-active={/add-channel/.test(position)}
                href="/project/{address}/add-channel/"
                ><span class="icon-text"
                  ><Icon name="add" class="mr-3" />{#if !collapse}<span
                      >Add</span
                    >{/if}</span
                ></a>
            </li>
          </ul>

          <div class="menu-label is-flex is-flex-direction-row-reverse">
            <hr class="m-0 is-flex-grow-5" />
          </div>

          {#if !mobile}
            <ul class="menu-list">
              <li>
                <a
                  href="#collapse"
                  on:keydown={keyDownA11y(() => {
                    collapse = !collapse
                  })}
                  on:click={() => {
                    collapse = !collapse
                  }}
                  ><span class="icon-text"
                    ><Icon
                      name={collapse ? 'openCollapse' : 'closeCollapse'}
                      class="mr-3" />{#if !collapse}<span>Collapse</span
                      >{/if}</span
                  ></a>
              </li>
            </ul>
            <div class="menu-label is-flex is-flex-direction-row-reverse">
              <hr class="m-0 is-flex-grow-5" />
            </div>
          {/if}
        </aside>
      </div>
    {/if}

    <div class:column={!mobile}>
      <section
        class="section has-background-white is-rounded"
        class:pt-1={mobile}>
        <slot />
      </section>
    </div>
  </div>
{/if}

<style lang="scss">
  @import '../../../../scss/_variables.scss';
  @import 'bulma/sass/utilities/_all';

  .navbar-burger {
    position: fixed;
    // vs breadcrumd
    margin: 1.5rem 0 !important;
    // equivalent desktop container
    right: 24px;
    background-color: $primary;
    color: $white;
    border-radius: 50%;
    width: 1.6em;
    height: 1.6em;
    margin-right: 0.75em;
    z-index: 22;
    span {
      width: 10px;
      left: calc(50% - 5px);
    }
  }

  .is-3or4 {
    flex: none;
    width: 265px;
  }

  aside {
    &.collapsed {
      width: 70px;
    }
  }

  @include mobile {
    .menu {
      position: fixed;
      // aka navbar
      top: 3.5rem;
      right: 0;
      width: calc(100% - 32px);
      max-width: 360px;
      z-index: 20;
      border: 1px solid #ddd;

      overflow-y: scroll;
      height: calc(100% - 4em);
    }
    .is-overlay {
      z-index: 19;
      background-color: $grey;
      position: fixed;
      top: 0;
      bottom: 0;
      opacity: 50%;
    }
  }

  .box {
    padding: 0.75rem;
    box-shadow: none;
  }

  .menu {
    .close {
      padding: 0.75em;
      .delete {
        background-color: $primary;
        color: $white;
      }
    }
  }

  .menu-head {
    .actions a {
      padding: 0 0.35rem;
      line-height: 1.55rem;
    }

    .icon.is-large {
      height: 2.9em;
      width: 2.9em;
    }

    margin-bottom: 0;
  }

  .menu-list {
    a {
      color: $black;
      padding: 0.5em 0em;
    }
    a:hover {
      color: $primary-hover;
      background-color: transparent;
    }

    a.is-active {
      color: $primary;
      background-color: transparent;
      font-weight: $weight-semibold;
    }
  }

  .menu-label {
    hr {
      border-bottom: 2px solid $secondary-disabled;
      margin: 1em 0 0 1em;
      box-sizing: content-box;
    }
  }

  .is-narrow {
    .menu-label {
      hr {
        margin: 1em 0 0 0;
      }
    }
    .menu-list {
      a {
        padding: 0.5em 0.5em;
      }
    }
  }
</style>
