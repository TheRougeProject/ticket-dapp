/* global __CONFIG_PLUGINS__ */

import { proxied } from 'svelte-proxied-store'

import { defaultEvmStores as evm, chainId } from 'ethers-svelte'

import Artifacts from '@rougenetwork/v2-core/Artifacts.json'

const pluginConfig = JSON.parse(__CONFIG_PLUGINS__ || '{}')

// TODO migrate Contract instantiation here ...

const createStore = () => {
  const {
    // delete: deleteProperty,
    assign,
    subscribe,
    emit,
    get
    // deleteAll
  } = proxied({
    get: function (target = {}, key) {
      if (/^factory$/.test(key)) {
        return Artifacts[evm.$chainId][0].contracts.RougeProxyFactory
      }
      if (/^singleton$/.test(key)) {
        return Artifacts[evm.$chainId][0].contracts.Rouge
      }
      if (/^hasPlugin/.test(key)) {
        return (plugin) => {
          if (!target.plugins) return false
          return target.plugins.includes(plugin)
        }
      }
      if (/^(plugins|pluginRoutes)/.test(key)) return target[key] || []
      return target[key]
    }
  })

  chainId.subscribe(() => {
    // TODO put contract helpers here ...

    const plugins = JSON.parse(
      import.meta.env[`VITE_APP_PLUGINS_${evm.$chainId}`] || '[]'
    )

    assign({
      plugins,
      pluginRoutes: Object.keys(pluginConfig)
        .filter(
          (plugin) => plugins.includes(plugin) && pluginConfig[plugin].path
        )
        .map((plugin) => pluginConfig[plugin]),
      pluginConfig // TODO reduce ?
    })
    emit()
  })

  return {
    subscribe,
    get
  }
}

const store = createStore()

export default store
