import { ethers } from 'ethers'

import { proxied } from 'svelte-proxied-store'

import { browser } from '$app/environment'

import blockchain from '$lib/blockchain'

import { defaultEvmStores as evm } from 'ethers-svelte'

const createStore = () => {
  const lock = {}

  const refreshBalance = async (storeKey, address, account) => {
    if (!browser || lock[storeKey]) return
    lock[storeKey] = true
    try {
      const checkins = {}
      const balances = {}
      // other options we store a Onject of all contract balances ...
      balances.total = await blockchain
        .rouge(evm.$chainId)(address)
        .balanceOf(account)

      // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
      const events = await blockchain
        .rouge(evm.$chainId)(address)
        .queryFilter(
          blockchain
            .rouge(evm.$chainId)(address)
            .filters.Transfer(null, account)
        )
      for (const { args } of events) {
        // TODO information with get information from nft.js store ...
        // centralize view call + invalidation ...
        const { owner, channelId } = await blockchain
          .rouge(evm.$chainId)(address)
          .getTokenInfos(args.tokenId)
        if (owner === account) {
          balances[channelId] = (balances[channelId] || 0) + 1
        }
      }
      assign({
        [storeKey]: balances
      })
      emit()
      for (const { args } of events) {
        const redemptions = await blockchain
          .rouge(evm.$chainId)(address)
          .queryFilter(
            blockchain
              .rouge(evm.$chainId)(address)
              .filters.Redeemed(null, args.tokenId)
          )
        if (redemptions.length === 1) {
          const {
            transactionHash,
            logIndex,
            args: { tokenId }
          } = redemptions[0]
          // console.log('****', { address, account, transactionHash, logIndex, tokenId } )
          checkins[transactionHash] = {
            [logIndex]: tokenId,
            ...(checkins[transactionHash] || {})
          }
        }
      }
      assign({
        [`${address}:checksIn:${account}`]: checkins
      })
      emit()
    } catch (e) {
      console.log('[store projects refresh]', { storeKey, e })
    }
    lock[storeKey] = false
  }

  const {
    // delete: deleteProperty,
    assign,
    subscribe,
    emit,
    get
    // deleteAll
  } = proxied({
    get: function (target, key) {
      if (/^balancesFor/.test(key)) {
        return (address, account = evm.$signerAddress) => {
          if (!ethers.isAddress(address)) return
          // TODO check address syntax ...
          const storeKey = `${address}:balancesFor:${account}`
          if (!target[storeKey]) refreshBalance(storeKey, address, account)
          return target[storeKey] || {}
        }
      }
      if (/^checksIn/.test(key)) {
        return (address, account = evm.$signerAddress) => {
          if (!ethers.isAddress(address)) return
          // TODO check address syntax ...
          const storeKey = `${address}:checksIn:${account}`
          if (!target[storeKey]) refreshBalance(storeKey, address, account)
          return target[storeKey] || {}
        }
      }
      return
    }
  })

  const invalidate = (address, account) => {
    const storeKey = `${address}:balancesFor:${account}`
    if (get(storeKey)) {
      refreshBalance(storeKey, address, account)
    }
  }

  return {
    subscribe,
    invalidate
  }
}

const store = createStore()

export default store
