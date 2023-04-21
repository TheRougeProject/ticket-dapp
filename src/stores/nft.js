import { ethers } from 'ethers'

import { proxied } from 'svelte-proxied-store'
import { defaultEvmStores as evm } from 'ethers-svelte'

import { browser } from '$app/environment'

import blockchain from '$lib/blockchain'

import project from '$stores/project.js'

const createStore = () => {
  const lock = {}
  let keys = []

  // add key ?
  const storageKey = () => `rge:nfts:${evm.$chainId}`

  const refresh = async (key) => {
    try {
      if (!browser || lock[key]) return
      const [contract, tokenId] = key.split(':')

      // TODO only work with hexify tokenId
      //if (!ethers.isAddress(contract) || !/^\d+$/.test(tokenId)) return
      if (!ethers.isAddress(contract)) return

      // console.log('load nft', { contract, tokenId })
      lock[key] = true
      const { owner, channelId, redeemed } = await blockchain
        .rouge(evm.$chainId)(contract)
        .getTokenInfos(tokenId)
      if (owner === evm.$signerAddress) {
        project.addBearer(contract)
      }
      assign({
        [key]: { contract, tokenId, owner, channelId, redeemed }
      })
      emit()
    } catch (e) {
      console.log('[error] $nft proxy', { key, e })
    }
    lock[key] = false
  }

  const {
    // delete: deleteProperty,
    assign,
    subscribe,
    emit,
    // get,
    deleteAll
  } = proxied({
    get: function (target, key) {
      if (key === 'keys') return target[key]
      // console.log('$nft proxy => ', {target, key})
      if (!target[key]) refresh(key)
      return target[key] || {}
    }
  })

  const clean = async () => {
    localStorage.setItem(storageKey(), JSON.stringify([]))
    deleteAll()
    emit()
  }

  const purge = async () => {
    console.log('project store purge')
    deleteAll()
    emit()
  }

  // XXX filter data ?
  const add = async (key) => {
    if (keys.includes(key)) return
    console.log('add nft', key)
    keys = [...keys, key]
    localStorage.setItem(storageKey(), JSON.stringify(keys))
    assign({
      keys
      //[project]: { key: project, ...data }
    })
    emit()
  }

  // only init if provider available...
  const init = async () => {
    keys = browser ? JSON.parse(localStorage.getItem(storageKey()) || '[]') : []
    assign({
      keys
    })

    emit()
  }

  return {
    init,
    purge,
    clean,
    add,
    refresh,
    subscribe
  }
}

const store = createStore()

export default store
