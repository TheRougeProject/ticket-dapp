<script>
  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import { netAbbr } from '$lib/enums.js'
  import { keyDownA11y } from '$lib/utils'

  import { clickoutside } from '$lib/actions/clickoutside.js'
  import { ipfs } from '$lib/actions/ipfs.js'

  import Icon from '$components/Icon.svelte'
  import Share from '$components/ShareButtons/index.svelte'
  import ClipboardCopy from '$components/tools/ClipboardCopy.svelte'
  import AddToCalendar from '$components/tools/AddToCalendar.svelte'

  // object with all data
  export let p

  dayjs.extend(localizedFormat)

  $: url = `${import.meta.env.VITE_PUBLIC_URL}i/ticket/${netAbbr(p._chainId)}:${
    p._address
  }`

  let calendarMenu = false

  const format = (url = '') => {
    // TODO ipfs
    return url.replace(/https?:\/\/(www.)?/, '')
  }
  const formatPostal = (p) => {
    return p.city
  }
</script>

<div class="columns is-multiline">
  <div class="column is-half">
    {#if p.visual}
      <img
        alt={p.name}
        data-ipfs={p.visual}
        style="object-fit: cover;"
        use:ipfs />
    {:else}
      <img alt={p.name} src="/empty_p.png" style="object-fit: cover;" />
    {/if}
  </div>

  <div class="column is-half projectRightPanel">
    {#if p._loaded}
      <h2 class="title is-size-4">{p.name}</h2>

      {#if p.when && p.when.length === 2}
        <h3 class="subtitle is-size-6 mb-0">
          from {dayjs(p.when[0]).format('LLLL')}
          <br />to {dayjs(p.when[1]).format('LLLL')}
        </h3>
      {/if}

      {#if false}
        <AddToCalendar
          let:google
          on:action={() => {
            calendarMenu = !calendarMenu
          }}>
          <div class="dropdown" class:is-active={calendarMenu}>
            <div class="dropdown-trigger">
              <p class="mt-2 oneLine">
                <span class="xtruncate side-menu">
                  <a
                    href="#dropdown"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    on:click={() => {
                      calendarMenu = !calendarMenu
                    }}>
                    <Icon name="calendar" /><span>Add to Calendar</span>
                  </a>
                </span>
              </p>
            </div>
            <div
              class="dropdown-menu"
              id="dropdown-menu"
              use:clickoutside
              on:clickoutside={() => {
                if (calendarMenu) calendarMenu = false
              }}
              role="menu">
              <div class="dropdown-content">
                <a href="#apple" class="dropdown-item">Apple</a>
                <a href="#google" on:click={google} class="dropdown-item"
                  >Google</a>
                <a href="#ical" class="dropdown-item">iCal</a>
                <a href="#microsoft365" class="dropdown-item">Microsoft365</a>
                <a href="#tems" class="dropdown-item">MicrosoftTeams</a>
                <a href="#outlook" class="dropdown-item">Outlook.com</a>
                <a href="#yahoo" class="dropdown-item">Yahoo</a>
              </div>
            </div>
          </div>
        </AddToCalendar>
      {/if}

      <p class="oneLine">
        <span class="truncate side-menu">
          {#if p.online && p.url}
            <Icon name="World" />
            <span>Online</span>
            <a rel="noreferrer" target="_blank" href={p.url}>{format(p.url)}</a>
          {:else if p.city}
            <Icon name="MapPin" /><span>{formatPostal(p)}</span>
          {/if}
        </span>
      </p>

      {#if p.contact && false}
        <Icon name="MapPin" /><span>Address todo</span>
      {/if}

      {#if !p._isDraft}
        <p class="oneLine">
          <span class="icon-text side-menu">
            <span>Share event</span>
            <ClipboardCopy let:copy text={url} tootipLabel="copied!">
              <a href="#copy" class="ml-2" on:click={copy}
                ><Icon name="Copy" /></a>
            </ClipboardCopy>
            <Share
              let:api
              let:telegram
              let:twitter
              let:facebook
              let:whatsapp
              let:linkedin
              {url}
              title={p.name}>
              {#if api}
                <a
                  href="#api"
                  class="ml-2"
                  on:keydown={keyDownA11y(api)}
                  on:click={api}><Icon name="share" /></a>
              {:else}
                <a
                  href="#telegram"
                  class="ml-2"
                  on:keydown={keyDownA11y(telegram)}
                  on:click={telegram}><Icon name="BrandTelegram" /></a>
                <a
                  href="#whatsapp"
                  class="ml-2"
                  on:keydown={keyDownA11y(whatsapp)}
                  on:click={whatsapp}><Icon name="BrandWhatsapp" /></a>
                <a
                  href="#twitter"
                  class="ml-2"
                  on:keydown={keyDownA11y(twitter)}
                  on:click={twitter}><Icon name="BrandTwitter" /></a>
                <a
                  href="#facebook"
                  class="ml-2"
                  on:keydown={keyDownA11y(facebook)}
                  on:click={facebook}><Icon name="BrandFacebook" /></a>
                <a
                  href="#linkedin"
                  class="ml-2"
                  on:keydown={keyDownA11y(linkedin)}
                  on:click={linkedin}><Icon name="BrandLinkedin" /></a>
              {/if}
            </Share>
          </span>
        </p>
      {/if}
    {:else}
      <div class="filler">
        <p>loading event...</p>
        <progress class="progress is-warn" />
      </div>
    {/if}
  </div>

  <div class="column is-full">
    {#if p._loaded}
      <slot />
    {/if}
  </div>
</div>

<style lang="scss" global>
  @import '../scss/_variables.scss';
  @import 'bulma/sass/utilities/_all';

  .filler {
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    opacity: 70%;
    > * {
      width: 50%;
      text-align: center;
    }
  }

  .projectRightPanel {
    position: relative;

    @include mobile {
      text-align: center;
    }

    .icon {
      align-items: center;
      justify-content: left;
      width: 1em;
    }

    .oneLine {
      height: 1.5em;

      .truncate {
        position: absolute;
        width: 100%;
        left: 0.75rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        line-height: 1.5em;
        .icon {
          margin-right: 0;
          align-items: center;
          display: inline-flex;
          justify-content: left;
          vertical-align: middle;
        }
      }
    }
  }
</style>
