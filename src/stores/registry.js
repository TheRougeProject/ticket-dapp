import { proxied } from 'svelte-proxied-store'

import { browser, dev } from '$app/environment'

// TODO optional encryption ...
const createStore = () => {
  const { assign, subscribe, emit, get } = proxied()

  // pan application settings/config, not chain specific
  const storageKey = 'rge:registry.1'

  if (browser) {
    assign(
      JSON.parse(localStorage.getItem(storageKey)) || {
        notify: true,
        defaultChain: dev ? 1337 : 1
      }
    )
    subscribe((values) =>
      localStorage.setItem(storageKey, JSON.stringify(values))
    )
  }

  const set = (key, value) => {
    assign({ [key]: value })
    emit()
  }

  return {
    subscribe,
    set,
    get
  }
}

const registry = createStore()

export default registry
