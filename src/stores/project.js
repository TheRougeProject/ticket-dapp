import { ethers } from 'ethers'

import { proxied } from 'svelte-proxied-store'
import { decodeRoles } from '@rougenetwork/v2-core/rouge'
import { TokenAmount } from 'erc-token-js'

import { browser } from '$app/environment'

import blockchain, { getChainTokens } from '$lib/blockchain'
import ipfs from '$lib/ipfs'
import { toHexString } from '$lib/utils.js'

// import chainContext from '$stores/chain.js'

import { defaultEvmStores as evm, signer, chainId } from 'ethers-svelte'

const createStore = () => {
  const lock = {}
  let addresses = []
  let addressesAsBearer = []
  let draftNonce = 0

  // XXX nonce is not per network to allow migration
  const draftNonceKey = () => `rge:draft:nonce`

  const projectsKey = ($chainId) => `rge:projects:${$chainId || evm.$chainId}`
  const bearerKey = ($chainId, $signerAddress) =>
    `rge:bearer:${$chainId || evm.$chainId}:${
      $signerAddress || evm.$signerAddress
    }`

  const watch = (address) => {
    evm.$provider.on({ address }, blockchain.handleRougeEvent(address))
    console.log('subscribers count %s', evm.$provider.listenerCount())
  }

  const add = (address) => {
    if (addresses.includes(address)) return
    console.log('add project address', address)
    addresses = [...addresses, address]
    localStorage.setItem(projectsKey(), JSON.stringify(addresses))
    // todo filter drafts
    watch(address)
    assign({ addresses })
    emit()
  }

  const rm = (address) => {
    if (!addresses.includes(address)) return
    // console.log('rm project', address)
    addresses = [...addresses.filter((a) => a !== address)]
    localStorage.setItem(projectsKey(), JSON.stringify(addresses))
    //unwatch(address)
    assign({ addresses })
    emit()
  }

  const isBookmarked = (address) => addressesAsBearer.includes(address)

  // change to bookmark
  const addBearer = (address) => {
    if (addressesAsBearer.includes(address)) return
    console.log('add bearer address', address)
    addressesAsBearer = [...addressesAsBearer, address]
    localStorage.setItem(bearerKey(), JSON.stringify(addressesAsBearer))
    watch(address)
    assign({ addressesAsBearer })
    emit()
  }

  const rmBearer = (address) => {
    if (!addressesAsBearer.includes(address)) return
    console.log('rm bearer project', address)
    addressesAsBearer = [...addressesAsBearer.filter((a) => a !== address)]
    localStorage.setItem(bearerKey(), JSON.stringify(addressesAsBearer))
    //unwatch(address)
    assign({ addressesAsBearer })
    emit()
  }

  const readEVMDeepState = async (address) => {
    if (!evm.$provider) return

    const events = await blockchain.rouge(evm.$chainId)(address).queryFilter(
      blockchain.rouge(evm.$chainId)(address).filters.ProjectSetup() // await $signer.getAddress())
    )
    if (events.length) {
      // TODO XXX change next version // or initial manager
      const { creator, manager, owner } = events[0].args
      assign({
        [address]: { ...get(address), creator, setupManager: manager || owner }
      })
      emit()
    }
  }

  const readEVMBaseState = async (address) => {
    if (!evm.$provider) return
    const { uri, channels, balances } = await blockchain
      .rouge(evm.$chainId)(address)
      .getInfos()
    console.log(`ONCHAIN data for ${address}`, { uri, channels, balances })

    const meta = await ipfs.getJSON(uri)
    meta.balances = {}
    const enabled = await decodeRoles(
      blockchain.rouge(evm.$chainId)(address),
      ['acquire', 'redeem'],
      ethers.ZeroAddress,
      meta.channels
    )
    meta.state = {
      acquired: 0n,
      redeemed: 0n,
      enabled: enabled[channels.length]
    }

    const TOKENS = getChainTokens(evm.$chainId, evm.$chainData)
    meta.channels = await Promise.all(
      channels.map(({ supply, totalAcquired, totalRedeemed, amount }, i) => {
        //if (state.token !== ethers.ZeroAddress) {
        //all should be done during create variant time...
        //const symbol = await blockchain.erc20(m.token).symbol()
        //}
        meta.state.acquired += totalAcquired
        meta.state.redeemed += totalRedeemed

        // XXX supply in state if updated possible

        // TODO generelize the amount building
        if (meta.channels[i].amount?.token?.symbol === 'USDC') {
          meta.channels[i].amount.token = {
            ...meta.channels[i].amount.token,
            ...TOKENS.USDC
          }
        }
        if (meta.channels[i].amount?.token?.symbol === 'ETH') {
          meta.channels[i].amount.token = {
            ...meta.channels[i].amount.token,
            _isNative: true
          }
        }

        if (meta.channels[i].amount) {
          meta.channels[i].amount = TokenAmount.from(meta.channels[i].amount)

          if (!meta.channels[i].amount.eq(amount)) {
            console.warn('incoherent channel id %s token amount', i)
          }
        } else {
          if (!BigInt(amount) === 0n) {
            console.warn('incoherent channel id %s token amount', i)
          }
        }
        return {
          ...meta.channels[i],
          _state: {
            supply,
            totalAcquired,
            totalRedeemed,
            enabled: enabled[i]
          }
        }
      })
    )

    for (let i = 0; i < channels.length; i++) {
      const address = channels[i].token || ethers.ZeroAddress

      console.log({
        channels,
        x: channels[i].amount,
        'meta.balances[address]': meta.balances[address],
        'channels[i].amount': channels[i].amount,
        test: channels[i].amount === 0n
      })

      if (meta.balances[address] || channels[i].amount === 0n) continue
      // pass zero as decimals when value comes from chain
      meta.balances[address] = meta.channels[i].amount.token.newAmount(
        balances[i],
        0
      )
    }

    console.log(`[projects:store] PARSED data for ${address}`, {
      enabled,
      meta,
      addressesAsBearer
    })

    // const events = await blockchain.rouge(evm.$chainId)(address).queryFilter(
    //   blockchain.rouge(evm.$chainId)(address).filters.AddedChannel() // await $signer.getAddress())
    // )
    // for (const e of events) {
    //   console.log('xxxxxxxxxxxxxxxxxxxxxxx', e)
    // }

    assign({
      [address]: {
        tags: { event: 'x' },
        uri,
        ...meta,
        _chainId: evm.$chainId.toString(),
        _address: address,
        _loaded: true
      }
    })
    emit()
  }

  const refresh = async (address) => {
    if (!browser || lock[address] || !ethers.isAddress(address)) return
    lock[address] = true
    try {
      console.log('refresh project', address)
      if (/^0x0000000000/.test(address)) {
        const data = {
          ...JSON.parse(localStorage.getItem(`rge:draft:${address}`)),
          _chainId: evm.$chainId.toString(),
          _isDraft: true,
          _loaded: true
        }
        // unserialized channel data
        if (data.channels && data.channels.length) {
          data.channels = data.channels.map((o) => {
            if (o.amount) o.amount = TokenAmount.from(o.amount)
            return o
          })
        }
        console.log('refresh:draft:before assign', data)
        assign({
          [address]: data
        })
        emit()
      } else {
        await readEVMBaseState(address)
        await readEVMDeepState(address) // TODO use another store for deep state ?
      }
    } catch (e) {
      console.log('[project store]', { address, e })
    }
    lock[address] = false
  }

  const {
    // delete: deleteProperty,
    assign,
    subscribe,
    emit,
    get,
    deleteAll
  } = proxied({
    get: function (target, key) {
      // XXX optimise pattern matching for speed ?
      if (key === 'addresses') return target[key] || []
      if (key === 'addressesAsBearer') return target[key] || []
      if (!target[key]) refresh(key)
      return target[key] || {}
    }
  })

  const clean = async () => {
    localStorage.setItem(projectsKey(), JSON.stringify([]))
    deleteAll()
    emit()
  }

  const purge = async () => {
    console.log('project store purge')
    deleteAll()
    emit()
  }

  // XXX naive 1 depth copy ...
  const serialize = (data) => {
    // console.log('DATA to serialize', data)
    return JSON.stringify({ ...data, _isDraft: true })
  }

  // draft project c(r)ud
  const updateDraft = async (address, data) => {
    console.log(data)
    localStorage.setItem(`rge:draft:${address}`, serialize(data))
    add(address)
  }

  const createDraft = async (data) => {
    console.log({ draftNonce })
    const address = toHexString(draftNonce, 40)
    updateDraft(address, data)
    draftNonce++
    localStorage.setItem(draftNonceKey(), draftNonce)
    return address
  }

  const deleteDraft = async (address) => {
    //localStorage.setItem(`rge:draft:${address}`, JSON.stringify(data))
    //localStorage.setItem(draftNonceKey(), draftNonce + 1)
    rm(address)
  }

  chainId.subscribe(($chainId) => {
    if (!$chainId || !browser) return
    // TODO unwatch ...
    addresses = JSON.parse(localStorage.getItem(projectsKey($chainId)) || '[]')
    addresses.forEach((address) => watch(address))
    assign({
      addresses
    })
    emit()
    // migrate to dev plugin
    // if (dev && $chainId === 1337) {
    //   const projects = JSON.parse(import.meta.env.VITE_TEST_PROJECTS_1337)
    //   for (const k of Object.keys(projects)) {
    //     add(projects[k].address)
    //   }
    // }
  })

  signer.subscribe(async ($signer) => {
    if (!$signer || !browser) return
    const account = await $signer.getAddress()
    const { chainId } = await $signer.provider.getNetwork()
    addressesAsBearer = JSON.parse(
      localStorage.getItem(bearerKey(chainId, account)) || '[]'
    )
    addressesAsBearer.forEach((address) => watch(address))
    assign({
      addressesAsBearer
    })
    emit()
  })

  const init = () => {
    draftNonce = browser
      ? parseInt(localStorage.getItem(draftNonceKey())) || 1
      : 1
    console.log('nonce...', draftNonce)
  }

  init()

  return {
    init,
    addresses,
    refresh,
    purge,
    clean,
    add,
    rm,
    isBookmarked,
    addBearer,
    rmBearer,
    subscribe,
    createDraft,
    updateDraft,
    deleteDraft
  }
}

const store = createStore()

export default store
