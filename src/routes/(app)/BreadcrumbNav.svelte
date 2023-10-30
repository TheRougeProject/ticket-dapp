<script>
  import { page } from '$app/stores'

  import Icon from '$components/Icon.svelte'

  import chainContext from '$stores/chain.js'

  let importedClasses = ''
  export { importedClasses as class }

  const activePlugin = (key) => {
    const re = new RegExp(key, 'i')
    return re.test($page.url.pathname)
  }

  const anyPlugin = () => {
    // TODO use path instead of plugin name ...
    for (const path of [...$chainContext.pluginRoutes, 'book']) {
      const re = new RegExp(path, 'i')
      if (re.test($page.url.pathname)) return true
    }
    return false
  }

  // TODO replace by Container ?

  // replace by expanding responsive global navigation ?
  // manager-nav mb-0 is-hidden-mobile
</script>

<nav class="level is-hidden-mobile {importedClasses}">
  <div class="level-left">
    <div class="level-item">
      <div
        class="breadcrumb has-succeeds-separator my-0"
        aria-label="breadcrumbs">
        <ul>
          <slot />
        </ul>
      </div>
    </div>
  </div>
  <div class="level-right">
    {#if anyPlugin()}
      <div class="level-item">
        <a class="button is-text is-small" href="/"
          ><Icon name="List" class="mr-1" />Event Manager</a>
      </div>
    {/if}
    {#if !/^\/book/.test($page.url.pathname)}
      <div class="level-item">
        <a class="button is-text is-small" href="/book"
          ><Icon name="Book" class="mr-1" />Tickets book</a>
      </div>
    {/if}
    {#if !/^\/hub/.test($page.url.pathname)}
      <div class="level-item">
        <a class="button is-text is-small" href="/hub"
          ><Icon name="Compass" class="mr-1" />Events hub</a>
      </div>
    {/if}
    {#each $chainContext.pluginRoutes as entry}
      {#if !activePlugin(entry.path)}
        <div class="level-item">
          <a class="button is-text is-small" href={entry.path}
            ><Icon name={entry.icon} class="mr-1" />{entry.label}</a>
        </div>
      {/if}
    {/each}
  </div>
</nav>
