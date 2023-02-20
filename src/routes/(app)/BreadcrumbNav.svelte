<script>
  /* global __CONFIG_PLUGINS__ */

  import { page } from '$app/stores'

  import Icon from '$components/Icon.svelte'

  let importedClasses = ''
  export { importedClasses as class }

  $: plugins = JSON.parse(__CONFIG_PLUGINS__ || {})

  const activePlugin = (key) => {
    const re = new RegExp(key, 'i')
    return re.test($page.url.pathname)
  }

  const anyPlugin = () => {
    for (const path of [...Object.keys(plugins), 'book']) {
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
    {#each Object.keys(plugins) as plugin}
      {#if plugins[plugin].label && !activePlugin(plugin)}
        <div class="level-item">
          <a class="button is-text is-small" href={plugin}
            ><Icon name={plugins[plugin].icon} class="mr-1" />{plugins[plugin]
              .label}</a>
        </div>
      {/if}
    {/each}
  </div>
</nav>
